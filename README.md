# Software Studio Midterm Project README

## 專案需求 Checklist

本 README 先整理簡報中的 **所有需求項目**，並依照大項分類，附上各項分數，方便後續逐項完成與檢查。
要加這個在.env
VITE_GIPHY_API_KEY=WwvcJWjuidOln7uvc3iDZnuxoNWNZfFU
---

## 1. Basic Components（50%）

### 1.1 Membership Mechanism（5%）
- [✅] Email Sign Up
- [✅] Email Sign In

### 1.2 Host your Firebase page（5%）
- [✅] 使用 Firebase Hosting 部署網站
- [✅] 確認網站可正常運作

### 1.3 Database read/write（5%）
- [✅] 會員資料或其他資料需能讀寫
- [✅] 資料存取必須使用 authenticated way

### 1.4 RWD（5%）
- [✅] 網站在不同尺寸裝置上都能正常顯示
- [✅] 所有元件都必須可見，不能消失
- [ ] 若小螢幕需要捲動才看得到主要版面，會被扣分

### 1.5 Git（5%）
- [✅] 使用 Git 做版本控制
- [✅] 要定期 commit，不可只在最後一天 commit

### 1.6 Chatroom（25%）
- [✅] 可建立 private chatroom，與本網站註冊會員聊天
- [✅] 其他成員可在 chatroom 中看到你的訊息
- [✅] 載入目前 chatroom 的所有歷史訊息
- [✅] 可邀請新成員加入 chatroom
- [✅] 可參考 Messenger 的 chatroom 邏輯設計

---

## 2. Advanced Components（35%）

### 2.1 Using framework（5%）
- [✅] 使用 React 或其他 framework

### 2.2 Third-party Sign Up / Sign In（1%）
- [ ] 使用 Google 或其他第三方帳號登入／註冊

### 2.3 Chrome notification（5%）
- [ ] 支援 Chrome 通知
- [ ] TA 會使用 Chrome 驗證
- [ ] 應通知 unread message，而不是所有訊息都通知

### 2.4 CSS animation（2%）
- [ ] 使用 CSS animation
- [ ] Button hover 不算 animation

### 2.5 Deal with problems when sending code（2%）
- [✅] 處理訊息中包含程式碼或 HTML 標籤的情況
- [✅] 例如：`<script>alert("example");</script>`
- [✅] 例如：`<h1>example</h1>`

### 2.6 User Profile（10%）
- [✅] Profile 需做成 modal 或獨立頁面
- [✅] 可編輯並儲存 Profile picture
- [✅] 可編輯並儲存 Username
- [✅] 可編輯並儲存 Email
- [✅] 可編輯並儲存 Phone number
- [✅] 可編輯並儲存 Address
- [✅] 在 chatroom 中至少顯示 email、username、profile picture 其中一項

### 2.7 Message operation（10%）
- [ ] Unsend message（只能收回自己傳的訊息）
- [ ] Edit message（只能編輯自己傳的訊息）
- [ ] Search message（可搜尋所有訊息）
- [ ] Send image（也可收回自己傳的圖片）

---

## 3. Bonus Components（at most 10%）

### 3.1 Chatbot（2%）
- [ ] 使用 ChatGPT 或 Gemini API 做 chatbot

### 3.2 Block User（2%）
- [ ] User A 封鎖 User B 後，User B 不能再傳 direct message 給 User A
- [ ] 若兩人已有聊天紀錄，UI 要顯示 warning notification
- [ ] 若兩人在同一個 group chat 中，彼此訊息需互相隱藏

### 3.3 Send gif from Tenor API（3%）
- [ ] 可從 Tenor API 傳送 GIF

### 3.4 Message emoji（3%）
- [ ] 可對訊息傳送 emoji
- [ ] emoji 數量可自行決定
- [ ] 使用者可收回自己送出的 emoji
- [ ] 多人對同一則訊息送 emoji 時，顯示方式可自行設計

### 3.5 Reply for specify message（6%）
- [✅] 可回覆指定訊息（包含自己的訊息）【3%】
- [✅] 使用者輸入回覆時，要在文字輸入框上方顯示被回覆的原訊息【1%】
- [✅] 點擊回覆訊息時，原訊息要有 visual highlight【1%】
- [✅] 點擊回覆訊息時，若原訊息不在畫面內，要自動 scroll 到原訊息【1%】

### 3.6 Send custom sticker into chatroom（10%）
#### Request
- [ ] 使用者點 drawing button 後，canvas UI 才出現
- [ ] custom sticker 傳送後不可再編輯
- [ ] 使用者畫圖時，chatroom box 會變成 canvas
- [ ] 若無法維持正確位置，可當一般圖片送出，但第三條件不給分

#### Score criteria
- [ ] Multiple colors to choose【2%】
- [ ] Multiple brush to choose【2%】
- [ ] Sticker 應顯示在使用者畫的位置【4%】
- [ ] Custom sticker 可以 unsend【2%】

---

## 4. Scoring Summary（105%）
- [ ] Basic components：50%
- [ ] Advance components：35%
- [ ] Total Completeness（subjective）：10%
- [ ] Bonus components：10%
- [ ] Total：105%

### 額外扣分注意
- [ ] README 不完整：-5
- [ ] SOP 不完整：-10

---

## 5. AI Usage

若開發時有使用 AI 工具，根目錄必須包含 **AI_reference.pdf**，內容需包含：

### 5.1 AI Tool(s) Used
- [ ] 寫明使用的模型或工具（例如 ChatGPT、Gemini）

### 5.2 Scope of Usage
對每一段由 AI 生成或協助的程式碼，都需記錄：
- [ ] Location：檔名與行號（例如 App.js, lines 45-82）
- [ ] Prompt & Response：完整 prompt 與 AI 回覆（建議附截圖）
- [ ] Refinement & Explanation：修改後版本、修改原因與邏輯說明

### 5.3 Statement of Non-Usage
- [ ] 若未使用 AI，PDF 中需寫：`No AI tools were used in this assignment.`

---

## 6. Reminder / Submission Requirements

### 6.1 Deploy
- [ ] 將網站部署到 Firebase page
- [ ] 確保網站可正常運作
- [ ] 主頁檔名必須為 `index.html`

### 6.2 Upload source code to FTP
- [ ] 將原始碼上傳 FTP

### 6.3 Zip file naming
- [ ] 壓縮檔命名為 `Midterm_Project_學號.zip`
- [ ] 若重新上傳，改為 `Midterm_Project_學號_v?.zip`

### 6.4 Zip file content
- [ ] 需包含 `index.html`, `.css`, `.js`, `README.md` 等必要檔案
- [ ] 不可包含 `node_modules`
- [ ] 若上傳 `node_modules`，扣 5 分

### 6.5 MD5 checksum
- [ ] 產生 zip 檔 MD5 checksum
- [ ] 將 MD5 填入指定表單
- [ ] 若未填 MD5，扣 10 分

### 6.6 Deadline
- [ ] FIRM deadline：`2026/05/07 23:59`
- [ ] 以 commit time 為準

### 6.7 eeclass submission
- [ ] 繳交 MD5
- [ ] 繳交網站連結
- [ ] 繳交 GitHub URL

---

## 7. 作業規則
- [ ] 嚴禁抄襲
- [ ] 抄襲者與被抄襲者直接當掉
- [ ] 繳交期限三個星期，不得遲交
- [ ] 沒有屍體分數
- [ ] 評分方式以日後公布為主

---

## 8. 如何不被判定抄襲？
- [ ] 不要直接照抄網站、生成式 AI、朋友討論的程式碼
- [ ] 應先理解內容，再用自己的邏輯重寫
- [ ] 若有參考外部來源，建議先用 MOSS 比對
- [ ] 建議將相似度控制在 20% 以下

---

## 9. 作業繳交規則
- [ ] 先對 zip 檔產生 MD5 checksum
- [ ] 將 checksum 填入 Google 表單
- [ ] 上傳 zip 到 FTP
- [ ] 再將 MD5 和網址繳交至 eeclass
- [ ] 若違反任一繳交 SOP，扣總分 10 分
- [ ] 建議保留 zip 檔到成績公告或期末

---

## 10. 作業繳交流程 SOP
1. [ ] 將作業壓縮成指定格式 zip 檔
2. [ ] 對 zip 檔產生 MD5
3. [ ] 填寫 Google 表單
4. [ ] 上傳 zip 到 FTP
5. [ ] 將 MD5 與網址交到 eeclass

---

## 11. 後續可補內容
- [ ] Website 功能說明
- [ ] 如何操作網站
- [ ] 如何在本機一步一步 setup
- [ ] Demo 截圖
- [ ] Firebase deploy 流程
- [ ] GitHub repo 說明
- [ ] 已完成功能對照表
