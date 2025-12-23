import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// 設置 MSW worker（用於瀏覽器環境）
export const worker = setupWorker(...handlers)

