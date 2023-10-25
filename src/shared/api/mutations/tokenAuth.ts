import { useMutation } from "@urql/vue";
import { ref, Ref } from "vue";

import { useSafeRequest } from "../../modules/network";

const mutation = `
mutation($token: String!) {
  tokenAuth(shareLinkHash: $token) {
    payload,
    token,
    refreshToken
  }
}
`

export function useTokenAuth() {
  const errors: Ref<any[]> = ref([])

  const safeRequest = useSafeRequest(errors)
  const { executeMutation, fetching: verifying } = useMutation(mutation)

  const tokenAuth = async (token: string) => {
    const data = await safeRequest(() => executeMutation({ token }))

    return data?.tokenAuth
  }

  return { errors, verifying, tokenAuth }
}
