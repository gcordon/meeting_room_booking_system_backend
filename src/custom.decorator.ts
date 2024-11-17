import { createParamDecorator, ExecutionContext, SetMetadata } from "@nestjs/common"
import { resourceUsage } from "process"

export const RequireLogin = () => {
    return SetMetadata('require-login', true)
}

export const RequirePermission = (...permissions: string[]) => {
    return SetMetadata('require-permission', permissions)
}

// 自定义装饰器：获取用户信息
export const UserInfo = createParamDecorator(
    (data: string, context: ExecutionContext,) => {
        // 从上下文中获取请求对象
        let request = context.switchToHttp().getRequest()
        // 从请求对象中获取用户信息
        let user = request.user
        // 如果用户信息不存在，返回 null
        if (!user) {
            return null
        }

        // 默认返回整个用户对象
        let result = user
        // 如果指定了特定的数据字段，则返回该字段的值
        if (data) {
            result = user[data]
        }
        // 返回结果
        return result
    }
)