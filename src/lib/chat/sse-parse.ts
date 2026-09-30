/**
 * SSE 文本缓冲解析（与传输 chunk 无关）。
 *
 * 为何不能「一个 chunk = 一个事件」：
 * HTTP/TCP 分块边界任意，一个事件可能被拆开，一块里也可能有多个事件。
 * 事件之间以空行（\n\n 或 \r\n\r\n）分隔。
 *
 * 字节层的 UTF-8 半字符问题由 TextDecoder({ stream: true }) 处理，本模块只收已经 decode 后的字符串。
 */

export type SseAppendResult = {
  /** 尚未凑齐事件边界的残留文本 */
  buffer: string;
  /** 本轮解析出的 data 载荷（不含 [DONE]） */
  dataPayloads: string[];
  /** 是否见到 data: [DONE] */
  sawDone: boolean;
};

/**
 * 把新 decode 出的文本追加进 buffer，吐出所有完整 SSE 事件中的 data 行。
 */
export function appendSseText(buffer: string, chunk: string): SseAppendResult {
  let buf = buffer + chunk;
  const dataPayloads: string[] = [];
  let sawDone = false;

  while (true) {
    const match = /\r?\n\r?\n/.exec(buf);
    if (!match || match.index === undefined) break;

    const rawEvent = buf.slice(0, match.index);
    buf = buf.slice(match.index + match[0].length);

    for (const line of rawEvent.split(/\r?\n/)) {
      if (!line || line.startsWith(':')) continue;
      if (!line.startsWith('data:')) continue;

      // 兼容 "data:" 与 "data: "
      const data = line.slice(5).replace(/^\s/, '');
      if (data === '[DONE]') {
        sawDone = true;
        continue;
      }
      if (data) dataPayloads.push(data);
    }
  }

  return { buffer: buf, dataPayloads, sawDone };
}
