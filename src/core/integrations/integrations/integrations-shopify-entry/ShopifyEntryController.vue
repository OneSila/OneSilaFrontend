<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { createShopifySalesChannelMutation, getShopifyRedirectUrlMutation } from "../../../../shared/api/mutations/salesChannels.js";
import { Loader } from "../../../../shared/components/atoms/loader";
import { Toast } from "../../../../shared/modules/toast";
import apolloClient from "../../../../../apollo-client";
import {
  hasCompany,
  injectAuth,
  isAuthenticated,
  refreshUser,
  removeAuth,
  setCompanyToUser
} from "../../../../shared/modules/auth";
import { generateUserCredentialsQuery } from "../../../../shared/api/queries/me";
import { loginMutation, registerMutation, registerCompanyMutation } from "../../../../shared/api/mutations/auth.js";
import { displayApolloError } from "../../../../shared/utils";
import {getShopifyChannelsQuery} from "../../../../shared/api/queries/salesChannels";


const {t, locale} = useI18n();
const route = useRoute();
const router = useRouter();
const auth = injectAuth();


const createShopifySalesChannel = async (queryParams: Record<string, any>, hostname: string) => {
  const shop = queryParams.shop as string;

  const { data } = await apolloClient.query({
    query: getShopifyChannelsQuery,
    variables: {
      filters: {
        hostname: { iContains: shop },
      },
      first: 1,
    },
    fetchPolicy: 'network-only',
  });

  const existing = data?.shopifyChannels?.edges?.[0]?.node;
  if (existing) {
    console.log('Shopify channel already exists, skipping creation.');
    return existing; // Return the existing channel
  }

  // 2. Prepare default input
  const dataInput = {
    hostname,
    active: true,
    verifySsl: true,
    requestsPerMinute: 60,
    maxRetries: 3,
    useConfigurableName: false,
    syncContents: true,
    syncEanCodes: true,
    syncPrices: true,
    importOrders: true,
    hmac: queryParams.hmac,
    timestamp: queryParams.timestamp,
    host: queryParams.host,
    isExternalInstall: true,
  };

  const { data: mutationData } = await apolloClient.mutate({
    mutation: createShopifySalesChannelMutation,
    variables: { data: dataInput },
  });

  const createdChannel = mutationData?.createShopifySalesChannel;
  if (!createdChannel) {
    throw new Error('Failed to create sales channel');
  }

  return createdChannel;
};


const handleShopifySalesChannelSuccess = async (channelData: any) => {
  const id = channelData.id;

  const { data } = await apolloClient.mutate({
    mutation: getShopifyRedirectUrlMutation,
    variables: { data: { id } },
  });

  const result = data?.getShopifyRedirectUrl;

  if (result?.redirectUrl) {
     window.location.href = result.redirectUrl;
    return;
  }

  const messages = result?.messages || [];
  messages.forEach((msg: any) => {
    Toast.error(msg.message);
  });

  router.push({
    name: 'integrations.integrations.show',
    params: { type: 'shopify', id },
  });
};

const getFakeUserCredentials = async (identifier?: string) => {
  const {data} = await apolloClient.query({
    query: generateUserCredentialsQuery,
    variables: {identifier},
    fetchPolicy: 'network-only',
  });

  if (!data?.generateUserCredentials) {
    throw new Error("Failed to generate fake user credentials");
  }

  return {
    username: data.generateUserCredentials.username,
    password: data.generateUserCredentials.password,
  }
}

const registerAndLoginUser = async (username: string, password: string) => {
  try {
    // 1. Register
    const { data } = await apolloClient.mutate({
      mutation: registerMutation,
      variables: {
        username,
        password,
        language: locale.value,
      },
    });

    const registeredUser = data?.registerUser;

    if (!registeredUser) {
      throw new Error(t('auth.register.failed'));
    }

    // 2. Login
    const { data: loginData } = await apolloClient.mutate({
      mutation: loginMutation,
      variables: {
        username,
        password,
      },
    });

    const user = loginData?.login;

    if (!user) {
      throw new Error(t('auth.login.failed'));
    }

    // 3. Refresh auth state
    refreshUser(auth, {
      username: user.username,
      language: user.language,
      firstName: user.firstName,
      lastName: user.lastName,
      onboardingStatus: user.onboardingStatus,
      company: user.multiTenantCompany,
      companyOwner: user.isMultiTenantCompanyOwner,
      active: user.isActive,
    });

    locale.value = user.language;

    return true;
  } catch (error) {
    console.error('Registration/Login failed:', error);
    displayApolloError(error);
    return false;
  }
};

const registerCompanyAfterLogin = async (shop: string) => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: registerCompanyMutation,
      variables: {
        name: shop,
        country: 'GB',
      },
    });

    const company = data?.registerMyMultiTenantCompany;
    if (!company) {
      throw new Error('Company registration failed.');
    }

    setCompanyToUser(auth, {
      id: company.id,
      name: company.name,
    });

    return company;
  } catch (error) {
    console.error('Company registration error:', error);
    displayApolloError(error);
    throw error;
  }
};

onMounted(async () => {
  const queryParams = route.query;
  const shop = queryParams.shop as string | undefined;

  if (!shop) {
    Toast.error(t('integrations.salesChannel.shopify.installed.missingParams'));
    throw new Error('Missing params.');
  }

  try {
    let hostname = `https://${shop}`;

    if (!isAuthenticated(auth)) {
        const { username, password } = await getFakeUserCredentials(shop);

        const success = await registerAndLoginUser(username, password);
        if (success) {
          await registerCompanyAfterLogin(shop);
        }
    }

    const createdChannel = await createShopifySalesChannel(queryParams, hostname);
    console.log(createdChannel)
    if (!createdChannel) {
      Toast.error(t('integrations.salesChannel.shopify.installed.genericError'));
      throw new Error('Create sales channel fail!.');
    }

    await handleShopifySalesChannelSuccess(createdChannel);

  } catch (e) {
    Toast.error(t('integrations.salesChannel.shopify.installed.genericError'));
    console.log(e)
    if (isAuthenticated(auth) && hasCompany(auth)) {
      await router.replace({ name: 'integrations.integrations.list' });
    } else {
      if (isAuthenticated(auth)) {
          await removeAuth(auth);
      }
      await router.replace({ name: 'auth.login' });
    }
  }
});


</script>

<template>
  <div class="p-8">
    <Loader :loading="true" />
  </div>
</template>
