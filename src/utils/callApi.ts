export async function callApi<T>(promise: Promise<T>, options?: { showLoading?: boolean }) {
  try {
    // 這裡可加 loading 狀態
    // loading.value = true
    const result = await promise
    // loading.value = false
    return result
  } catch (err) {
    // loading.value = false
    // 統一錯誤處理
    // message.error(err.message)
    throw err
  }
}