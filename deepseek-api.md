## deepseek官方调用方式

### 1. 上传文件

post请求：https://chat.deepseek.com/api/v0/file/upload_file


FormData格式参数：
- file: 文件

fetch请求案例

```js
// ... existing code ...

const formData = new FormData();
formData.append('file', fileInput.files[0]); // 假设fileInput是一个<input type="file">元素

const response = await fetch('https://chat.deepseek.com/api/v0/file/upload_file', {
  method: 'POST',
  body: formData
});

if (response.ok) {
  const jsonResponse = await response.json();
  console.log("文件上传成功:", jsonResponse);
} else {
  console.error("文件上传失败，状态码：", response.status);
}

// ... existing code ...
```

返回：

```json
{
    "code": 0,
    "msg": "",
    "data": {
        "biz_code": 0,
        "biz_msg": "",
        "biz_data": {
            "id": "file-c1a47be0-4a48-4153-a758-b8af81be210e",
            "status": "PENDING",
            "file_name": "1-原告主体材料.pdf",
            "file_size": 316622,
            "token_usage": 0,
            "error_code": null,
            "inserted_at": 1738849171.763514,
            "updated_at": 1738849171.763514
        }
    }
}
```
### 2. 创建消息

post请求：https://chat.deepseek.com/api/v0/chat_session/create


请求内容：
character_id: null

fetch请求案例

```js
const response = await fetch('https://chat.deepseek.com/api/v0/chat_session/create', {
  method: 'POST',
  body: JSON.stringify({ character_id: null })
})
```

返回：

```json
{
    "code": 0,
    "msg": "",
    "data": {
        "biz_code": 0,
        "biz_msg": "",
        "biz_data": {
            "id": "d2a5ebe3-fb28-4fed-9056-8dbb0d770fa4",
            "seq_id": 1000026,
            "agent": "chat",
            "character": null,
            "title": null,
            "title_type": null,
            "version": 0,
            "current_message_id": null,
            "inserted_at": 1738849071.647492,
            "updated_at": 1738849071.647492
        }
    }
}
```

### 3. 发送消息

post请求：https://chat.deepseek.com/api/v0/chat/completion

请求内容：

```json
chat_session_id: "d2a5ebe3-fb28-4fed-9056-8dbb0d770fa4"
parent_message_id: null
prompt: "你好"
ref_file_ids: []
search_enabled: false
thinking_enabled: false
```

fetch请求案例

```js
const response = await fetch('https://chat.deepseek.com/api/v0/chat/completion', {
  method: 'POST',
  body: JSON.stringify({ chat_session_id: "d2a5ebe3-fb28-4fed-9056-8dbb0d770fa4", parent_message_id: null, prompt: "你好", ref_file_ids: [], search_enabled: false, thinking_enabled: false })
}) 
```

返回：流式数据响应（要做流式数据处理）

