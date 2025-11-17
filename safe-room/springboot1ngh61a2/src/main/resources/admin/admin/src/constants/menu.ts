/**
 * Menu configuration constants
 * Contains all menu structure and role-based access configurations
 */
import type { MenuRole } from '@/types/menu'

export const MENU_CONFIG: MenuRole[] = [
  {
    backMenu: [
      {
        child: [
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete', 'Home Total', 'Expiration Reminder'],
            appFrontIcon: 'cuIcon-vip',
            buttons: ['Add', 'View', 'Edit', 'Delete', 'Expiration Reminder'],
            menu: 'User',
            menuJump: 'List',
            tableName: 'yonghu',
          },
        ],
        menu: 'User Management',
      },
      {
        child: [
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete', 'Private Coaching Reservation'],
            appFrontIcon: 'cuIcon-camera',
            buttons: ['Add', 'View', 'Edit', 'Delete'],
            menu: 'Fitness Coach',
            menuJump: 'List',
            tableName: 'jianshenjiaolian',
          },
        ],
        menu: 'Fitness Coach Management',
      },
      {
        child: [
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete', 'Review', 'Pay'],
            appFrontIcon: 'cuIcon-full',
            buttons: ['View', 'Edit', 'Delete'],
            menu: 'Private Coaching Reservation',
            menuJump: 'List',
            tableName: 'sijiaoyuyue',
          },
        ],
        menu: 'Private Coaching Reservation Management',
      },
      {
        child: [
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete'],
            appFrontIcon: 'cuIcon-camera',
            buttons: ['Add', 'View', 'Edit', 'Delete'],
            menu: 'Course Type',
            menuJump: 'List',
            tableName: 'kechengleixing',
          },
        ],
        menu: 'Course Type Management',
      },
      {
        child: [
          {
            allButtons: [
              'Add',
              'View',
              'Edit',
              'Delete',
              'Course Type Statistics',
              'Coach Course Statistics',
              'View Comments',
              'Home Total',
              'Course Reservation',
            ],
            appFrontIcon: 'cuIcon-attentionfavor',
            buttons: ['Add', 'View', 'Edit', 'Delete', 'View Comments'],
            menu: 'Fitness Course',
            menuJump: 'List',
            tableName: 'jianshenkecheng',
          },
        ],
        menu: 'Fitness Course Management',
      },
      {
        child: [
          {
            allButtons: [
              'Add',
              'View',
              'Edit',
              'Delete',
              'Review',
              'Pay',
              'Course Daily Revenue',
              'Home Total',
              'Home Statistics',
              'Refund',
            ],
            appFrontIcon: 'cuIcon-brand',
            buttons: ['View', 'Edit', 'Delete'],
            menu: 'Course Reservation',
            menuJump: 'List',
            tableName: 'kechengyuyue',
          },
        ],
        menu: 'Course Reservation Management',
      },
      {
        child: [
          {
            allButtons: [
              'Add',
              'View',
              'Edit',
              'Delete',
              'Review',
              'Pay',
              'Course Daily Revenue',
              'Home Total',
              'Home Statistics',
            ],
            appFrontIcon: 'cuIcon-vipcard',
            buttons: ['View', 'Edit', 'Delete', 'Pay', 'Review'],
            menu: 'Course Refund',
            menuJump: 'List',
            tableName: 'kechengtuike',
          },
        ],
        menu: 'Course Refund Management',
      },
      {
        child: [
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete', 'Purchase'],
            appFrontIcon: 'cuIcon-phone',
            buttons: ['Add', 'View', 'Edit', 'Delete'],
            menu: 'Membership Card',
            menuJump: 'List',
            tableName: 'huiyuanka',
          },
        ],
        menu: 'Membership Card Management',
      },
      {
        child: [
          {
            allButtons: [
              'Add',
              'View',
              'Edit',
              'Delete',
              'Pay',
              'Membership Purchase Statistics',
              'Home Total',
              'Home Statistics',
            ],
            appFrontIcon: 'cuIcon-qrcode',
            buttons: ['View', 'Edit', 'Delete'],
            menu: 'Membership Card Purchase',
            menuJump: 'List',
            tableName: 'huiyuankagoumai',
          },
        ],
        menu: 'Membership Card Purchase Management',
      },
      {
        child: [
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete'],
            appFrontIcon: 'cuIcon-skin',
            buttons: ['Add', 'View', 'Edit', 'Delete'],
            menu: 'Expiration Reminder',
            menuJump: 'List',
            tableName: 'daoqitixing',
          },
        ],
        menu: 'Expiration Reminder Management',
      },
      {
        child: [
          {
            allButtons: [
              'Add',
              'View',
              'Edit',
              'Delete',
              'Pay',
              'Membership Renewal Statistics',
              'Home Total',
              'Home Statistics',
            ],
            appFrontIcon: 'cuIcon-skin',
            buttons: ['View', 'Delete'],
            menu: 'Membership Renewal',
            menuJump: 'List',
            tableName: 'huiyuanxufei',
          },
        ],
        menu: 'Membership Renewal Management',
      },
      {
        child: [
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete'],
            appFrontIcon: 'cuIcon-medal',
            buttons: ['Add', 'View', 'Edit', 'Delete'],
            menu: 'Fitness Equipment',
            menuJump: 'List',
            tableName: 'jianshenqicai',
          },
        ],
        menu: 'Fitness Equipment Management',
      },
      {
        child: [
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete'],
            appFrontIcon: 'cuIcon-vip',
            buttons: ['Add', 'View', 'Edit', 'Delete'],
            menu: 'Carousel Management',
            tableName: 'config',
          },
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete'],
            appFrontIcon: 'cuIcon-news',
            buttons: ['Add', 'View', 'Edit', 'Delete'],
            menu: 'Announcement',
            tableName: 'news',
          },
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete'],
            appFrontIcon: 'cuIcon-news',
            buttons: ['Add', 'View', 'Edit', 'Delete'],
            menu: 'Announcement Category',
            tableName: 'newstype',
          },
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete'],
            appFrontIcon: 'cuIcon-service',
            buttons: ['View', 'Edit', 'Delete'],
            menu: 'Feedback',
            tableName: 'chat',
          },
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete', 'Batch Status', 'Export'],
            appFrontIcon: 'cuIcon-picfill',
            buttons: ['Add', 'View', 'Edit', 'Delete'],
            menu: 'Assets Management',
            menuJump: 'List',
            tableName: 'assets',
          },
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete'],
            appFrontIcon: 'cuIcon-user',
            buttons: ['Add', 'View', 'Edit', 'Delete'],
            menu: 'Admin Users',
            menuJump: 'List',
            tableName: 'users',
          },
          {
            allButtons: ['View', 'Export'],
            appFrontIcon: 'cuIcon-log',
            buttons: ['View', 'Export'],
            menu: 'Operation Log',
            menuJump: 'List',
            tableName: 'operationLog',
          },
          {
            allButtons: ['View', 'Mark as Read', 'Delete'],
            appFrontIcon: 'cuIcon-bell',
            buttons: ['View', 'Mark as Read', 'Delete'],
            menu: 'System Messages',
            menuJump: 'List',
            tableName: 'systemMessages',
          },
          {
            allButtons: ['View'],
            appFrontIcon: 'cuIcon-server',
            buttons: ['View'],
            menu: 'Service Status',
            menuJump: 'List',
            tableName: 'serviceStatus',
          },
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete'],
            appFrontIcon: 'cuIcon-document',
            buttons: ['Add', 'View', 'Edit', 'Delete'],
            menu: 'Legal Terms',
            menuJump: 'List',
            tableName: 'legalTerms',
          },
        ],
        menu: 'System Management',
      },
    ],
    frontMenu: [
      {
        child: [
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete', 'Private Coaching Reservation'],
            appFrontIcon: 'cuIcon-vipcard',
            buttons: ['View', 'Private Coaching Reservation'],
            menu: 'Fitness Coach List',
            menuJump: 'List',
            tableName: 'jianshenjiaolian',
          },
        ],
        menu: 'Fitness Coach Module',
      },
      {
        child: [
          {
            allButtons: [
              'Add',
              'View',
              'Edit',
              'Delete',
              'Course Type Statistics',
              'Coach Course Statistics',
              'View Comments',
              'Home Total',
              'Course Reservation',
            ],
            appFrontIcon: 'cuIcon-rank',
            buttons: ['View', 'Course Reservation'],
            menu: 'Fitness Course List',
            menuJump: 'List',
            tableName: 'jianshenkecheng',
          },
        ],
        menu: 'Fitness Course Module',
      },
      {
        child: [
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete', 'Purchase'],
            appFrontIcon: 'cuIcon-paint',
            buttons: ['View', 'Purchase'],
            menu: 'Membership Card List',
            menuJump: 'List',
            tableName: 'huiyuanka',
          },
        ],
        menu: 'Membership Card Module',
      },
      {
        child: [
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete'],
            appFrontIcon: 'cuIcon-camera',
            buttons: ['View'],
            menu: 'Fitness Equipment List',
            menuJump: 'List',
            tableName: 'jianshenqicai',
          },
        ],
        menu: 'Fitness Equipment Module',
      },
    ],
    hasBackLogin: 'yes',
    hasBackRegister: 'no',
    hasFrontLogin: 'no',
    hasFrontRegister: 'no',
    roleName: 'Administrator',
    tableName: 'users',
  },
  {
    backMenu: [
      {
        child: [
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete', 'Review', 'Pay'],
            appFrontIcon: 'cuIcon-full',
            buttons: ['View', 'Pay'],
            menu: 'Private Coaching Reservation',
            menuJump: 'List',
            tableName: 'sijiaoyuyue',
          },
        ],
        menu: 'Private Coaching Reservation Management',
      },
      {
        child: [
          {
            allButtons: [
              'Add',
              'View',
              'Edit',
              'Delete',
              'Review',
              'Pay',
              'Course Daily Revenue',
              'Home Total',
              'Home Statistics',
              'Refund',
            ],
            appFrontIcon: 'cuIcon-brand',
            buttons: ['View', 'Pay', 'Refund'],
            menu: 'Course Reservation',
            menuJump: 'List',
            tableName: 'kechengyuyue',
          },
        ],
        menu: 'Course Reservation Management',
      },
      {
        child: [
          {
            allButtons: [
              'Add',
              'View',
              'Edit',
              'Delete',
              'Review',
              'Pay',
              'Course Daily Revenue',
              'Home Total',
              'Home Statistics',
            ],
            appFrontIcon: 'cuIcon-vipcard',
            buttons: ['View'],
            menu: 'Course Refund',
            menuJump: 'List',
            tableName: 'kechengtuike',
          },
        ],
        menu: 'Course Refund Management',
      },
      {
        child: [
          {
            allButtons: [
              'Add',
              'View',
              'Edit',
              'Delete',
              'Pay',
              'Membership Purchase Statistics',
              'Home Total',
              'Home Statistics',
            ],
            appFrontIcon: 'cuIcon-qrcode',
            buttons: ['View', 'Pay'],
            menu: 'Membership Card Purchase',
            menuJump: 'List',
            tableName: 'huiyuankagoumai',
          },
        ],
        menu: 'Membership Card Purchase Management',
      },
      {
        child: [
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete'],
            appFrontIcon: 'cuIcon-skin',
            buttons: ['View'],
            menu: 'Expiration Reminder',
            menuJump: 'List',
            tableName: 'daoqitixing',
          },
        ],
        menu: 'Expiration Reminder Management',
      },
      {
        child: [
          {
            allButtons: [
              'Add',
              'View',
              'Edit',
              'Delete',
              'Pay',
              'Membership Renewal Statistics',
              'Home Total',
              'Home Statistics',
            ],
            appFrontIcon: 'cuIcon-skin',
            buttons: ['Add', 'View', 'Pay'],
            menu: 'Membership Renewal',
            menuJump: 'List',
            tableName: 'huiyuanxufei',
          },
        ],
        menu: 'Membership Renewal Management',
      },
    ],
    frontMenu: [
      {
        child: [
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete', 'Private Coaching Reservation'],
            appFrontIcon: 'cuIcon-vipcard',
            buttons: ['View', 'Private Coaching Reservation'],
            menu: 'Fitness Coach List',
            menuJump: 'List',
            tableName: 'jianshenjiaolian',
          },
        ],
        menu: 'Fitness Coach Module',
      },
      {
        child: [
          {
            allButtons: [
              'Add',
              'View',
              'Edit',
              'Delete',
              'Course Type Statistics',
              'Coach Course Statistics',
              'View Comments',
              'Home Total',
              'Course Reservation',
            ],
            appFrontIcon: 'cuIcon-rank',
            buttons: ['View', 'Course Reservation'],
            menu: 'Fitness Course List',
            menuJump: 'List',
            tableName: 'jianshenkecheng',
          },
        ],
        menu: 'Fitness Course Module',
      },
      {
        child: [
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete', 'Purchase'],
            appFrontIcon: 'cuIcon-paint',
            buttons: ['View', 'Purchase'],
            menu: 'Membership Card List',
            menuJump: 'List',
            tableName: 'huiyuanka',
          },
        ],
        menu: 'Membership Card Module',
      },
      {
        child: [
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete'],
            appFrontIcon: 'cuIcon-camera',
            buttons: ['View'],
            menu: 'Fitness Equipment List',
            menuJump: 'List',
            tableName: 'jianshenqicai',
          },
        ],
        menu: 'Fitness Equipment Module',
      },
    ],
    hasBackLogin: 'no',
    hasBackRegister: 'no',
    hasFrontLogin: 'yes',
    hasFrontRegister: 'yes',
    roleName: 'User',
    tableName: 'yonghu',
  },
  {
    backMenu: [
      {
        child: [
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete', 'Review', 'Pay'],
            appFrontIcon: 'cuIcon-full',
            buttons: ['View', 'Review'],
            menu: 'Private Coaching Reservation',
            menuJump: 'List',
            tableName: 'sijiaoyuyue',
          },
        ],
        menu: 'Private Coaching Reservation Management',
      },
      {
        child: [
          {
            allButtons: [
              'Add',
              'View',
              'Edit',
              'Delete',
              'Course Type Statistics',
              'Coach Course Statistics',
              'View Comments',
              'Home Total',
              'Course Reservation',
            ],
            appFrontIcon: 'cuIcon-attentionfavor',
            buttons: ['View'],
            menu: 'Fitness Course',
            menuJump: 'List',
            tableName: 'jianshenkecheng',
          },
        ],
        menu: 'Fitness Course Management',
      },
      {
        child: [
          {
            allButtons: [
              'Add',
              'View',
              'Edit',
              'Delete',
              'Review',
              'Pay',
              'Course Daily Revenue',
              'Home Total',
              'Home Statistics',
              'Refund',
            ],
            appFrontIcon: 'cuIcon-brand',
            buttons: ['View', 'Review'],
            menu: 'Course Reservation',
            menuJump: 'List',
            tableName: 'kechengyuyue',
          },
        ],
        menu: 'Course Reservation Management',
      },
      {
        child: [
          {
            allButtons: [
              'Add',
              'View',
              'Edit',
              'Delete',
              'Review',
              'Pay',
              'Course Daily Revenue',
              'Home Total',
              'Home Statistics',
            ],
            appFrontIcon: 'cuIcon-vipcard',
            buttons: ['View', 'Review'],
            menu: 'Course Refund',
            menuJump: 'List',
            tableName: 'kechengtuike',
          },
        ],
        menu: 'Course Refund Management',
      },
    ],
    frontMenu: [
      {
        child: [
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete', 'Private Coaching Reservation'],
            appFrontIcon: 'cuIcon-vipcard',
            buttons: ['View', 'Private Coaching Reservation'],
            menu: 'Fitness Coach List',
            menuJump: 'List',
            tableName: 'jianshenjiaolian',
          },
        ],
        menu: 'Fitness Coach Module',
      },
      {
        child: [
          {
            allButtons: [
              'Add',
              'View',
              'Edit',
              'Delete',
              'Course Type Statistics',
              'Coach Course Statistics',
              'View Comments',
              'Home Total',
              'Course Reservation',
            ],
            appFrontIcon: 'cuIcon-rank',
            buttons: ['View', 'Course Reservation'],
            menu: 'Fitness Course List',
            menuJump: 'List',
            tableName: 'jianshenkecheng',
          },
        ],
        menu: 'Fitness Course Module',
      },
      {
        child: [
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete', 'Purchase'],
            appFrontIcon: 'cuIcon-paint',
            buttons: ['View', 'Purchase'],
            menu: 'Membership Card List',
            menuJump: 'List',
            tableName: 'huiyuanka',
          },
        ],
        menu: 'Membership Card Module',
      },
      {
        child: [
          {
            allButtons: ['Add', 'View', 'Edit', 'Delete'],
            appFrontIcon: 'cuIcon-camera',
            buttons: ['View'],
            menu: 'Fitness Equipment List',
            menuJump: 'List',
            tableName: 'jianshenqicai',
          },
        ],
        menu: 'Fitness Equipment Module',
      },
    ],
    hasBackLogin: 'yes',
    hasBackRegister: 'no',
    hasFrontLogin: 'no',
    hasFrontRegister: 'no',
    roleName: 'Fitness Coach',
    tableName: 'jianshenjiaolian',
  },
]

/**
 * Get menu list for the application
 * @returns {Array} Menu configuration array
 */
export function getMenuList(): MenuRole[] {
  return MENU_CONFIG
}
