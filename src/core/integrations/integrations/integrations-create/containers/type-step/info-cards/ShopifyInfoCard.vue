<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { Card } from "../../../../../../../shared/components/atoms/card";
import { Button } from "../../../../../../../shared/components/atoms/button";
import { Icon } from "../../../../../../../shared/components/atoms/icon";
import { Image } from "../../../../../../../shared/components/atoms/image";
import { Toast } from "../../../../../../../shared/modules/toast";

import step2Image from "../../../../../../../assets/images/integrations/info/shopify/step2.png";
import step3Image from "../../../../../../../assets/images/integrations/info/shopify/step3.png";
import step4Image from "../../../../../../../assets/images/integrations/info/shopify/step4.png";
import step5Image1 from "../../../../../../../assets/images/integrations/info/shopify/step5-1.png";
import step5Image2 from "../../../../../../../assets/images/integrations/info/shopify/step5-2.png";
import step5Image3 from "../../../../../../../assets/images/integrations/info/shopify/step5-3.png";
import step6Image from "../../../../../../../assets/images/integrations/info/shopify/step-6.png";
import step8Image from "../../../../../../../assets/images/integrations/info/shopify/step8.png";

const emit = defineEmits<{ (e: "close"): void }>();
const { t } = useI18n();
const close = () => emit("close");

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    Toast.success(t("shared.alert.toast.clipboardSuccess"));
  } catch (err) {
    console.error("Failed to copy:", err);
    Toast.error(t("shared.alert.toast.clipboardFail"));
  }
};
</script>

<template>
  <Card class="modal-content w-[80%] px-10 pt-10">
    <div class="mb-6">
      <h3 class="text-xl font-semibold leading-7 text-gray-900">
        {{ t("integrations.create.wizard.step1.shopifyInfoModal.title") }}
      </h3>
    </div>
    <div class="space-y-10 pr-2 mb-4 overflow-y-auto max-h-96">
      <!-- Create custom app -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold">Create Custom App</h4>
        <p class="text-sm text-gray-700">
          {{
            t(
              "integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep1",
            )
          }}
        </p>
        <div class="space-y-2">
          <p class="text-sm text-gray-700">
            {{
              t(
                "integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep2",
              )
            }}
          </p>
          <Image :source="step2Image" alt="step 2" class="w-full rounded-md" />
        </div>
        <div class="md:grid md:grid-cols-2 md:gap-4 items-start">
          <p class="text-sm text-gray-700">
            {{
              t(
                "integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep3",
              )
            }}
          </p>
          <Image
            :source="step3Image"
            alt="step 3"
            class="w-full rounded-md mt-2 md:mt-0"
          />
        </div>
      </div>

      <!-- Detect website url -->
      <div class="space-y-2">
        <h4 class="text-lg font-semibold">Detect Website URL</h4>
        <div class="md:grid md:grid-cols-12 md:gap-4 items-start">
          <p class="text-sm text-gray-700 md:col-span-9">
            {{
              t(
                "integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep4",
              )
            }}
          </p>
          <Image
            :source="step4Image"
            alt="step 4"
            class="w-full rounded-md mt-2 md:mt-0 md:col-span-3"
          />
        </div>
      </div>

      <!-- Configure distribution -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold">Configure Distribution</h4>

        <div class="md:grid md:grid-cols-2 md:gap-4 items-start">
          <p class="text-sm text-gray-700">
            {{
              t(
                "integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep5Part1",
              )
            }}
          </p>
          <Image
            :source="step5Image1"
            alt="step 5-1"
            class="w-full rounded-md mt-2 md:mt-0"
          />
        </div>

        <div class="md:grid md:grid-cols-2 md:gap-4 items-start">
          <Image
            :source="step5Image2"
            alt="step 5-2"
            class="w-full rounded-md mt-2 md:mt-0"
          />
          <p class="text-sm text-gray-700">
            {{
              t(
                "integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep5Part2",
              )
            }}
          </p>
        </div>

        <div class="md:grid md:grid-cols-2 md:gap-4 items-start">
          <p class="text-sm text-gray-700">
            {{
              t(
                "integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep5Part3",
              )
            }}
          </p>
          <Image
            :source="step5Image3"
            alt="step 5-3"
            class="w-full rounded-md mt-2 md:mt-0"
          />
        </div>
      </div>

      <!-- Configure urls -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold">Configure URLs</h4>
        <div class="md:grid md:grid-cols-12 md:gap-4 items-start">
          <Image
            :source="step6Image"
            alt="step 6"
            class="w-full rounded-md md:col-span-6"
          />
          <div class="mt-4 md:mt-0 md:col-span-6 space-y-2">
            <p class="text-sm text-gray-700">
              {{
                t(
                  "integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep6",
                )
              }}
            </p>
            <div class="space-y-2">
              <label class="text-sm font-semibold block text-gray-900">
                {{
                  t(
                    "integrations.create.wizard.step1.shopifyInfoModal.section.appUrlLabel",
                  )
                }}
              </label>
              <div class="relative mt-1 rounded-lg shadow-sm">
                <input
                  disabled
                  type="text"
                  value="https://onesila.app/integrations/shopify/entry"
                  class="w-full rounded-lg border-0 py-1.5 pl-2 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Button
                    @click="
                      copyToClipboard(
                        'https://onesila.app/integrations/shopify/entry',
                      )
                    "
                    class="ml-4 flex-shrink-0"
                  >
                    <Icon
                      name="clipboard"
                      class="h-5 w-5 text-gray-500"
                      aria-hidden="true"
                    />
                  </Button>
                </div>
              </div>
              <label class="text-sm font-semibold block text-gray-900">
                {{
                  t(
                    "integrations.create.wizard.step1.shopifyInfoModal.section.allowedRedirectUrlLabel",
                  )
                }}
              </label>
              <div class="relative mt-1 rounded-lg shadow-sm">
                <input
                  disabled
                  type="text"
                  value="https://onesila.app/integrations/shopify/installed"
                  class="w-full rounded-lg border-0 py-1.5 pl-2 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Button
                    @click="
                      copyToClipboard(
                        'https://onesila.app/integrations/shopify/installed',
                      )
                    "
                    class="ml-4 flex-shrink-0"
                  >
                    <Icon
                      name="clipboard"
                      class="h-5 w-5 text-gray-500"
                      aria-hidden="true"
                    />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Finish wizard -->
      <div class="space-y-2">
        <h4 class="text-lg font-semibold">Finish Current Wizard</h4>
        <p class="text-sm text-gray-700">
          {{
            t(
              "integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep7",
            )
          }}
        </p>
        <br>
        <div class="md:grid md:grid-cols-2 md:gap-4 items-start">
        <p class="text-sm text-gray-700">
          {{
            t(
              "integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep8",
            )
          }}
        </p>
          <Image
            :source="step8Image"
            alt="step 8"
            class="w-full rounded-md mt-2 md:mt-0"
          />
        </div>
      </div>
    </div>

    <hr />
    <div class="flex justify-end gap-4 mt-4">
      <Button class="btn btn-outline-dark" @click="close">{{
        t("shared.button.cancel")
      }}</Button>
    </div>
  </Card>
</template>
