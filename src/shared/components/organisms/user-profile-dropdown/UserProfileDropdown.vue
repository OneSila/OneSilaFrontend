<script setup lang="ts">
import { Icon } from "../../atoms/icon";
import { injectAuth, removeAuth } from "../../../modules/auth";
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { Link } from "../../atoms/link";
import { Button } from "../../atoms/button";
import { useI18n } from "vue-i18n";
import {ApolloSubscription} from "../../molecules/apollo-subscription";
import {aiPointsSubscriptions} from "../../../api/subscriptions/me";
import {CompanyProfileEditForm} from "../../../../core/profile/company/containers/company-profile-edit-form";

const { t } = useI18n();

const auth = injectAuth();
const user = ref(auth.user)
const router = useRouter();

const logout = async () => {

  await removeAuth(auth);
  router.replace({ name: 'auth.login' });
};

</script>

<template>
  <div class="dropdown shrink-0">
      <Popper :placement="'bottom-start'" offsetDistance="8" class="!block">
          <button type="button" class="relative group block">
            <Icon name="user" class="w-8 h-8 rounded-full object-cover saturate-50 group-hover:saturate-100 text-gray-600 hover:text-indigo-600" />
          </button>
          <template #content="{ close }">
              <ul class="text-dark dark:text-white-dark !py-0 w-[230px] font-semibold dark:text-white-light/90">
                  <li>
                      <div class="flex items-center px-4 py-4">
                          <div class="ltr:pl-4 rtl:pr-4 truncate">
                              <h4 class="text-base">
                                {{ user.firstName }} {{ user.lastName }}
                              </h4>
                              <a class="text-black/60 hover:text-primary dark:text-dark-light/60 dark:hover:text-white" href="javascript:;">{{ user.username }}</a>
                          </div>
                      </div>
                  </li>
                 <li>
                    <div class="flex items-center px-2 py-6  border-2 rounded-lg border-purple-400 hover:bg-purple-50">
                      <Icon name="gem" size="xl" class="text-purple-600" />


                        <ApolloSubscription :subscription="aiPointsSubscriptions" ref="apolloSubRef">
                          <template v-slot:default="{ loading, error, result }">
                            <template v-if="!loading && result">
                              <span :class="{'text-red-600': (result as any).myMultiTenantCompany.aiPoints < 0}">
                                {{ (result as any).myMultiTenantCompany.aiPoints }} SilAI Credits
                              </span>
                            </template>
                          </template>
                        </ApolloSubscription>

                      <Icon name="info-circle"
                            class="w-4.5 h-4.5 text-gray-400 ltr:ml-2 rtl:mr-2"
                            :title="t('auth.register.company.aiPointsMessage')" />
                    </div>
                  </li>
                  <li>
                    <Link :path="{name: 'profile.user'}" class="dark:hover:text-white" @click="close()" block>
                        <Icon name="user" class="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 shrink-0" />
                        {{ t('profile.dropdown.profile') }}
                    </Link>
                  </li>
                  <li>
                    <Link :path="{name: 'profile.company'}" class="dark:hover:text-white" @click="close()" block>
                        <Icon name="building" class="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 shrink-0" />
                        {{ t('profile.dropdown.company') }}
                    </Link>
                  </li>
                  <li>
                    <Link :path="{name: 'settings.currencies.list'}" class="dark:hover:text-white" @click="close()" block>
                        <Icon name="cog" class="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 shrink-0" />
                        {{ t('settings.title') }}
                    </Link>
                  </li>
                  <li class="border-t border-white-light dark:border-white-light/10">
                      <Button class="text-danger !py-3 " @click="logout()">
                          <Icon name="sign-out" class="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 shrink-0" />
                          {{ t('profile.dropdown.signOut') }}
                      </Button>
                  </li>
              </ul>
          </template>
      </Popper>
  </div>
</template>