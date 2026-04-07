# Coze API 使用指南

## 网页搜索功能配置

当需要获取一些实时信息或无法直接获取的信息时，可以通过配置 Coze 工作流来实现网页搜索功能。

### 函数配置步骤

1. 打开函数配置页面
2. 点击"添加函数"按钮
3. 填写以下配置信息：

#### 基本信息
- 函数名称：`search_web`
- 函数描述：搜索网页，获取实时信息或无法直接获取的信息
- 请求方法：`POST`
- API URL：`api.coze.cn/v1/workflow/run`

#### 参数定义
```json
{
  "workflow_id": {
    "type": "string",
    "description": "工作流ID"
  },
  "parameters": {
    "type": "object",
    "description": "搜索内容",
    "properties": {
      "input": {
        "type": "string",
        "description": "搜索内容"
      }
    }
  }
}
```

#### 请求头
```json
{
  "Authorization": "Bearer xxxxxx",
  "Content-Type": "application/json"
}
```

### 使用示例

1. 在函数配置页面添加上述配置
2. 在工作流ID中填入：`xxxxxx`
3. 在测试面板中可以直接测试：
   ```json
   {
     "workflow_id": "xxxxxx",
     "parameters": {
       "input": "今天的天气如何"
     }
   }
   ```

### 注意事项

1. 请确保已正确配置 API Key（替换 Authorization 中的 xxxxxx）
2. 工作流 ID 需要使用实际的 ID（替换示例中的 xxxxxx）
3. 搜索内容应该具体明确，以获得更准确的结果
4. 建议在正式使用前先使用测试面板进行测试

### 响应格式

成功响应示例：
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "biz_code": 0,
    "biz_msg": "success",
    "biz_data": {
      "id": "run_xxx",
      "content": "搜索结果内容...",
      "status": "completed",
      "error_code": null,
      "inserted_at": 1234567890,
      "updated_at": 1234567890
    }
  }
}
```

### 常见问题

1. **API Key 无效**
   - 检查 Authorization 头部是否正确配置
   - 确认 API Key 是否已过期或被禁用

2. **工作流 ID 错误**
   - 确认使用的是正确的工作流 ID
   - 检查工作流是否处于可用状态

3. **请求失败**
   - 检查网络连接
   - 确认请求参数格式是否正确
   - 查看错误响应信息进行排查

### 相关链接

- [Coze 官方](https://www.coze.cn/)
- [API 参考](https://www.coze.cn/open/docs/developer_guides/workflow_run)
