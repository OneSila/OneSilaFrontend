<script setup lang="ts">
import { Tabs } from '../../../../../../../shared/components/molecules/tabs';
import { Button } from '../../../../../../../shared/components/atoms/button';
import { useI18n } from 'vue-i18n';

const payloadExample = `{
  "id": "<outbox.webhook_id>",
  "event": "<topic>",
  "action": "<CREATE|UPDATE|DELETE>",
  "version": "<integration.version>",
  "occurred_at": "<utc iso8601>",
  "subject": {"type": "...", "id": "...", "sku": "optional"},
  "mode": "<delta|full>",
  "data": {
    "before": { ... },
    "after": { ... },
    "changed_fields": [ ... ]
  }
}`;

const { t } = useI18n();

const tabs = [
  { name: 'python', label: t('integrations.webhook.infoBlock.languages.python') },
  { name: 'node', label: t('integrations.webhook.infoBlock.languages.node') },
  { name: 'php', label: t('integrations.webhook.infoBlock.languages.php') }
];

const codes = {
  python: `import hmac, hashlib, time\n\nsecret = b"<your_webhook_secret>"\nheader = request.headers["X-OneSila-Signature"]  # "t=timestamp,v1=hash"\ntimestamp, signature = header.split(",")\ntimestamp = int(timestamp.split("=")[1])\nexpected_sig = hmac.new(secret, f"{timestamp}.{request.body}".encode(), hashlib.sha256).hexdigest()\n\nif not hmac.compare_digest(signature.split("=")[1], expected_sig):\n    raise Exception("Invalid signature")`,
    node: `const crypto = require("crypto");\n\nfunction verify(body, header, secret) {\n  const [tPart, v1Part] = header.split(",");\n  const timestamp = tPart.split("=")[1];\n  const signature = v1Part.split("=")[1];\n\n  const payload = \`\${timestamp}.\${body}\`;\n  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");\n\n  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));\n}`,
  php: `$secret = "<your_webhook_secret>";\n$header = $_SERVER["HTTP_X_ONESILA_SIGNATURE"]; // "t=...,v1=..."\nlist($tPart, $v1Part) = explode(",", $header);\n$timestamp = explode("=", $tPart)[1];\n$signature = explode("=", $v1Part)[1];\n\n$payload = $timestamp . "." . $body;\n$expected = hash_hmac("sha256", $payload, $secret);\n\nif (!hash_equals($signature, $expected)) {\n    throw new Exception("Invalid signature");\n}`
};

function copyCode(lang: string) {
  navigator.clipboard.writeText(codes[lang]);
}
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold">{{ t('integrations.webhook.infoBlock.payloadExample') }}</h3>
    <pre class="bg-gray-100 p-4 rounded text-xs overflow-auto">{{ payloadExample }}</pre>

    <h3 class="text-lg font-semibold mt-6">{{ t('integrations.webhook.infoBlock.signatureValidation') }}</h3>
    <Tabs :tabs="tabs">
      <template #python>
        <div>
          <pre class="bg-gray-100 p-4 rounded text-xs overflow-auto">{{ codes.python }}</pre>
          <Button class="mt-2" @click="copyCode('python')">{{ t('shared.button.copy') }}</Button>
        </div>
      </template>
      <template #node>
        <div>
          <pre class="bg-gray-100 p-4 rounded text-xs overflow-auto">{{ codes.node }}</pre>
          <Button class="mt-2" @click="copyCode('node')">{{ t('shared.button.copy') }}</Button>
        </div>
      </template>
      <template #php>
        <div>
          <pre class="bg-gray-100 p-4 rounded text-xs overflow-auto">{{ codes.php }}</pre>
          <Button class="mt-2" @click="copyCode('php')">{{ t('shared.button.copy') }}</Button>
        </div>
      </template>
    </Tabs>
  </div>
</template>
