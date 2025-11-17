import type { MenuRole } from '@/types/menu'

const menuData: MenuRole[] = [
  {
    backMenu: [
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除', '首页总数', '到期提醒'],
            appFrontIcon: 'cuIcon-vip',
            buttons: ['新增', '查看', '修改', '删除', '到期提醒'],
            menu: '用户',
            menuJump: '列表',
            tableName: 'yonghu',
          },
        ],
        menu: '用户管理',
      },
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除', '私教预约'],
            appFrontIcon: 'cuIcon-camera',
            buttons: ['新增', '查看', '修改', '删除'],
            menu: '健身教练',
            menuJump: '列表',
            tableName: 'jianshenjiaolian',
          },
        ],
        menu: '健身教练管理',
      },
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除', '审核', '支付'],
            appFrontIcon: 'cuIcon-full',
            buttons: ['查看', '修改', '删除'],
            menu: '私教预约',
            menuJump: '列表',
            tableName: 'sijiaoyuyue',
          },
        ],
        menu: '私教预约管理',
      },
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除'],
            appFrontIcon: 'cuIcon-camera',
            buttons: ['新增', '查看', '修改', '删除'],
            menu: '课程类型',
            menuJump: '列表',
            tableName: 'kechengleixing',
          },
        ],
        menu: '课程类型管理',
      },
      {
        child: [
          {
            allButtons: [
              '新增',
              '查看',
              '修改',
              '删除',
              '课程类型统计',
              '教练课程统计',
              '查看评论',
              '首页总数',
              '课程预约',
            ],
            appFrontIcon: 'cuIcon-attentionfavor',
            buttons: ['新增', '查看', '修改', '删除', '查看评论'],
            menu: '健身课程',
            menuJump: '列表',
            tableName: 'jianshenkecheng',
          },
        ],
        menu: '健身课程管理',
      },
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除', '审核', '支付', '课程日收入', '首页总数', '首页统计', '退课'],
            appFrontIcon: 'cuIcon-brand',
            buttons: ['查看', '修改', '删除'],
            menu: '课程预约',
            menuJump: '列表',
            tableName: 'kechengyuyue',
          },
        ],
        menu: '课程预约管理',
      },
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除', '审核', '支付', '课程日收入', '首页总数', '首页统计'],
            appFrontIcon: 'cuIcon-vipcard',
            buttons: ['查看', '修改', '删除', '支付', '审核'],
            menu: '课程退课',
            menuJump: '列表',
            tableName: 'kechengtuike',
          },
        ],
        menu: '课程退课管理',
      },
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除', '购买'],
            appFrontIcon: 'cuIcon-phone',
            buttons: ['新增', '查看', '修改', '删除'],
            menu: '会员卡',
            menuJump: '列表',
            tableName: 'huiyuanka',
          },
        ],
        menu: '会员卡管理',
      },
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除', '支付', '会员购买统计', '首页总数', '首页统计'],
            appFrontIcon: 'cuIcon-qrcode',
            buttons: ['查看', '修改', '删除'],
            menu: '会员卡购买',
            menuJump: '列表',
            tableName: 'huiyuankagoumai',
          },
        ],
        menu: '会员卡购买管理',
      },
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除'],
            appFrontIcon: 'cuIcon-skin',
            buttons: ['新增', '查看', '修改', '删除'],
            menu: '到期提醒',
            menuJump: '列表',
            tableName: 'daoqitixing',
          },
        ],
        menu: '到期提醒管理',
      },
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除', '支付', '会员续费统计', '首页总数', '首页统计'],
            appFrontIcon: 'cuIcon-skin',
            buttons: ['查看', '删除'],
            menu: '会员续费',
            menuJump: '列表',
            tableName: 'huiyuanxufei',
          },
        ],
        menu: '会员续费管理',
      },
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除'],
            appFrontIcon: 'cuIcon-medal',
            buttons: ['新增', '查看', '修改', '删除'],
            menu: '健身器材',
            menuJump: '列表',
            tableName: 'jianshenqicai',
          },
        ],
        menu: '健身器材管理',
      },
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除'],
            appFrontIcon: 'cuIcon-vip',
            buttons: ['新增', '查看', '修改', '删除'],
            menu: '轮播图管理',
            tableName: 'config',
          },
          {
            allButtons: ['新增', '查看', '修改', '删除'],
            appFrontIcon: 'cuIcon-news',
            buttons: ['新增', '查看', '修改', '删除'],
            menu: '公告信息',
            tableName: 'news',
          },
          {
            allButtons: ['新增', '查看', '修改', '删除'],
            appFrontIcon: 'cuIcon-news',
            buttons: ['新增', '查看', '修改', '删除'],
            menu: '公告信息分类',
            tableName: 'newstype',
          },
          {
            allButtons: ['新增', '查看', '修改', '删除'],
            appFrontIcon: 'cuIcon-service',
            buttons: ['查看', '修改', '删除'],
            menu: '留言反馈',
            tableName: 'chat',
          },
        ],
        menu: '系统管理',
      },
    ],
    frontMenu: [
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除', '私教预约'],
            appFrontIcon: 'cuIcon-vipcard',
            buttons: ['查看', '私教预约'],
            menu: '健身教练列表',
            menuJump: '列表',
            tableName: 'jianshenjiaolian',
          },
        ],
        menu: '健身教练模块',
      },
      {
        child: [
          {
            allButtons: [
              '新增',
              '查看',
              '修改',
              '删除',
              '课程类型统计',
              '教练课程统计',
              '查看评论',
              '首页总数',
              '课程预约',
            ],
            appFrontIcon: 'cuIcon-rank',
            buttons: ['查看', '课程预约'],
            menu: '健身课程列表',
            menuJump: '列表',
            tableName: 'jianshenkecheng',
          },
        ],
        menu: '健身课程模块',
      },
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除', '购买'],
            appFrontIcon: 'cuIcon-paint',
            buttons: ['查看', '购买'],
            menu: '会员卡列表',
            menuJump: '列表',
            tableName: 'huiyuanka',
          },
        ],
        menu: '会员卡模块',
      },
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除'],
            appFrontIcon: 'cuIcon-camera',
            buttons: ['查看'],
            menu: '健身器材列表',
            menuJump: '列表',
            tableName: 'jianshenqicai',
          },
        ],
        menu: '健身器材模块',
      },
    ],
    hasBackLogin: '是',
    hasBackRegister: '否',
    hasFrontLogin: '否',
    hasFrontRegister: '否',
    roleName: '管理员',
    tableName: 'users',
  },
  {
    backMenu: [
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除', '审核', '支付'],
            appFrontIcon: 'cuIcon-full',
            buttons: ['查看', '支付'],
            menu: '私教预约',
            menuJump: '列表',
            tableName: 'sijiaoyuyue',
          },
        ],
        menu: '私教预约管理',
      },
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除', '审核', '支付', '课程日收入', '首页总数', '首页统计', '退课'],
            appFrontIcon: 'cuIcon-brand',
            buttons: ['查看', '支付', '退课'],
            menu: '课程预约',
            menuJump: '列表',
            tableName: 'kechengyuyue',
          },
        ],
        menu: '课程预约管理',
      },
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除', '审核', '支付', '课程日收入', '首页总数', '首页统计'],
            appFrontIcon: 'cuIcon-vipcard',
            buttons: ['查看'],
            menu: '课程退课',
            menuJump: '列表',
            tableName: 'kechengtuike',
          },
        ],
        menu: '课程退课管理',
      },
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除', '支付', '会员购买统计', '首页总数', '首页统计'],
            appFrontIcon: 'cuIcon-qrcode',
            buttons: ['查看', '支付'],
            menu: '会员卡购买',
            menuJump: '列表',
            tableName: 'huiyuankagoumai',
          },
        ],
        menu: '会员卡购买管理',
      },
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除'],
            appFrontIcon: 'cuIcon-skin',
            buttons: ['查看'],
            menu: '到期提醒',
            menuJump: '列表',
            tableName: 'daoqitixing',
          },
        ],
        menu: '到期提醒管理',
      },
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除', '支付', '会员续费统计', '首页总数', '首页统计'],
            appFrontIcon: 'cuIcon-skin',
            buttons: ['新增', '查看', '支付'],
            menu: '会员续费',
            menuJump: '列表',
            tableName: 'huiyuanxufei',
          },
        ],
        menu: '会员续费管理',
      },
    ],
    frontMenu: [
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除', '私教预约'],
            appFrontIcon: 'cuIcon-vipcard',
            buttons: ['查看', '私教预约'],
            menu: '健身教练列表',
            menuJump: '列表',
            tableName: 'jianshenjiaolian',
          },
        ],
        menu: '健身教练模块',
      },
      {
        child: [
          {
            allButtons: [
              '新增',
              '查看',
              '修改',
              '删除',
              '课程类型统计',
              '教练课程统计',
              '查看评论',
              '首页总数',
              '课程预约',
            ],
            appFrontIcon: 'cuIcon-rank',
            buttons: ['查看', '课程预约'],
            menu: '健身课程列表',
            menuJump: '列表',
            tableName: 'jianshenkecheng',
          },
        ],
        menu: '健身课程模块',
      },
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除', '购买'],
            appFrontIcon: 'cuIcon-paint',
            buttons: ['查看', '购买'],
            menu: '会员卡列表',
            menuJump: '列表',
            tableName: 'huiyuanka',
          },
        ],
        menu: '会员卡模块',
      },
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除'],
            appFrontIcon: 'cuIcon-camera',
            buttons: ['查看'],
            menu: '健身器材列表',
            menuJump: '列表',
            tableName: 'jianshenqicai',
          },
        ],
        menu: '健身器材模块',
      },
    ],
    hasBackLogin: '否',
    hasBackRegister: '否',
    hasFrontLogin: '是',
    hasFrontRegister: '是',
    roleName: '用户',
    tableName: 'yonghu',
  },
  {
    backMenu: [
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除', '审核', '支付'],
            appFrontIcon: 'cuIcon-full',
            buttons: ['查看', '审核'],
            menu: '私教预约',
            menuJump: '列表',
            tableName: 'sijiaoyuyue',
          },
        ],
        menu: '私教预约管理',
      },
      {
        child: [
          {
            allButtons: [
              '新增',
              '查看',
              '修改',
              '删除',
              '课程类型统计',
              '教练课程统计',
              '查看评论',
              '首页总数',
              '课程预约',
            ],
            appFrontIcon: 'cuIcon-attentionfavor',
            buttons: ['查看'],
            menu: '健身课程',
            menuJump: '列表',
            tableName: 'jianshenkecheng',
          },
        ],
        menu: '健身课程管理',
      },
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除', '审核', '支付', '课程日收入', '首页总数', '首页统计', '退课'],
            appFrontIcon: 'cuIcon-brand',
            buttons: ['查看', '审核'],
            menu: '课程预约',
            menuJump: '列表',
            tableName: 'kechengyuyue',
          },
        ],
        menu: '课程预约管理',
      },
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除', '审核', '支付', '课程日收入', '首页总数', '首页统计'],
            appFrontIcon: 'cuIcon-vipcard',
            buttons: ['查看', '审核'],
            menu: '课程退课',
            menuJump: '列表',
            tableName: 'kechengtuike',
          },
        ],
        menu: '课程退课管理',
      },
    ],
    frontMenu: [
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除', '私教预约'],
            appFrontIcon: 'cuIcon-vipcard',
            buttons: ['查看', '私教预约'],
            menu: '健身教练列表',
            menuJump: '列表',
            tableName: 'jianshenjiaolian',
          },
        ],
        menu: '健身教练模块',
      },
      {
        child: [
          {
            allButtons: [
              '新增',
              '查看',
              '修改',
              '删除',
              '课程类型统计',
              '教练课程统计',
              '查看评论',
              '首页总数',
              '课程预约',
            ],
            appFrontIcon: 'cuIcon-rank',
            buttons: ['查看', '课程预约'],
            menu: '健身课程列表',
            menuJump: '列表',
            tableName: 'jianshenkecheng',
          },
        ],
        menu: '健身课程模块',
      },
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除', '购买'],
            appFrontIcon: 'cuIcon-paint',
            buttons: ['查看', '购买'],
            menu: '会员卡列表',
            menuJump: '列表',
            tableName: 'huiyuanka',
          },
        ],
        menu: '会员卡模块',
      },
      {
        child: [
          {
            allButtons: ['新增', '查看', '修改', '删除'],
            appFrontIcon: 'cuIcon-camera',
            buttons: ['查看'],
            menu: '健身器材列表',
            menuJump: '列表',
            tableName: 'jianshenqicai',
          },
        ],
        menu: '健身器材模块',
      },
    ],
    hasBackLogin: '是',
    hasBackRegister: '否',
    hasFrontLogin: '否',
    hasFrontRegister: '否',
    roleName: '健身教练',
    tableName: 'jianshenjiaolian',
  },
]

const menu = {
  list(): MenuRole[] {
    return menuData
  },
}

export default menu
