/**
 * FlyClash 配置覆写脚本 - *type 转 Smart (增强版)
 *
 * 功能：
 * 1. 将指定类型的代理组转换为 Smart 代理组。
 * 2. 可选添加预训练模型配置（LightGBM）。
 * 3. 增加配置项，控制哪些原始类型（如 select, fallback, url-test 等）需要被转换。
 * * 作者：FlyClash
 * 修改日期：2025-12-05
 *
 * 说明：
 * - Smart 组：智能选择节点（支持更多策略，如 LightGBM）
 * - 脚本会保留所有原有配置，只修改代理组类型和添加智能配置
 */

// ========== 用户配置区 ==========

/**
 * 是否启用预训练模型配置
 * true: 添加 LightGBM 预训练模型配置 (uselightgbm=true, strategy='sticky-sessions')
 * false: 仅转换类型，不添加额外智能配置
 */
const ENABLE_PRETRAINED_MODEL = true;

/**
 * 需要转换的原始策略组类型列表。
 * 只有原始 type 属性在此列表中的代理组才会被转换为 'smart' 类型。
 * * 常见类型包括:
 * - 'url-test' (自动选择)
 * - 'select' (手动选择)
 * - 'fallback' (故障转移)
 * - 'load-balance' (负载均衡)
 */
const GROUP_TYPES_TO_CONVERT = [
    'url-test',
    //'select',
    // 可以根据需要添加更多类型以转换为smart，例如：
    // 'fallback',
    // 'load-balance'
];

// ================================

function main(config) {
    // 检查是否存在 proxy-groups
    if (!config || !config['proxy-groups']) {
        console.log('[FlyClash] 配置文件中没有找到 proxy-groups');
        return config;
    }

    let convertedCount = 0;
    const proxyGroups = config['proxy-groups'];
    
    // 输出当前配置状态
    console.log(`[FlyClash] 预训练模型配置: ${ENABLE_PRETRAINED_MODEL ? '已启用' : '已禁用'}`);
    console.log(`[FlyClash] 目标转换类型: [${GROUP_TYPES_TO_CONVERT.join(', ')}]`);

    // 遍历所有代理组
    for (let i = 0; i < proxyGroups.length; i++) {
        const group = proxyGroups[i];
        const originalType = group.type;

        // 检查是否为需要转换的类型
        if (GROUP_TYPES_TO_CONVERT.includes(originalType)) {
            // 转换为 smart 类型
            group.type = 'smart';
            
            // 如果启用预训练模型，添加相关配置
            if (ENABLE_PRETRAINED_MODEL) {
                // 添加 LightGBM 预训练模型配置
                group.uselightgbm = true;
                group.collectdata = false;
                group.strategy = 'sticky-sessions';
                
                console.log(`[FlyClash] 已转换代理组: ${group.name} (${originalType} → smart) [已添加预训练模型]`);
            } else {
                console.log(`[FlyClash] 已转换代理组: ${group.name} (${originalType} → smart)`);
            }
            
            convertedCount++;
        }
    }

    // 输出转换结果
    if (convertedCount > 0) {
        console.log(`[FlyClash] ✅ 成功转换 ${convertedCount} 个代理组为 Smart 类型`);
        if (ENABLE_PRETRAINED_MODEL) {
            console.log('[FlyClash] ✅ 已为所有转换的代理组添加预训练模型配置');
        }
    } else {
        console.log('[FlyClash] ℹ️  没有找到需要转换的代理组');
    }

    return config;
}
