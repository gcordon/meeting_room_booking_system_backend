// 导入加密模块
import { BadRequestException, ParseIntPipe } from '@nestjs/common';
import * as crypto from 'crypto'

/**
 * 计算字符串的MD5哈希值
 * @param {string} str - 要计算哈希值的输入字符串
 * @returns {string} 返回32位的MD5哈希值
 */
export function md5(str) {
    // 创建MD5哈希对象，更新输入，并以十六进制格式返回摘要
    return crypto.createHash('md5').update(str).digest('hex')
}

export function generateParseIntPipe(name) {
    return new ParseIntPipe({
      exceptionFactory() {
        throw new BadRequestException(name + ' 应该传数字');
      } 
    })
}