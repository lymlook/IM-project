import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login' //登录页
import Home from '@/components/Home'  // 首页
import Index from '@/components/Index'// 首页
import AdminManage from '@/components/admin/AdminManage' // 管理员管理
import MenuManage from '@/components/menu/MenuManage'   // 权限规则管理
import RoleManage from '@/components/role/RoleManage'   // 角色管理
import SystemLog from '@/components/systemLog/SystemLog'   // 系统日志
import SystemSet from '@/components/systemSet/SystemSet'   // 系统设置
import MenusManage from '@/components/menusManage/MenusManage'  // 菜单管理
import GroupList from '@/components/group/GroupList' // 群组列表
import UserList from '@/components/user/UserList' // 用户列表
import AccountAdd from '@/components/user/AccountAdd' // 代理列表
import TabbarSet from '@/components/tabbar/TabbarSet' // tabbar栏设置
import ChatSet from '@/components/chat/ChatSet' // 聊天设置
import CrossSet from '@/components/crossSet/CrossSet' // 跨域设置
import serviceChatSet from '@/components/serviceChatSet/serviceChatSet' // 客服小蜜自动回复设置
import Notice from '@/components/notice/Notice' // 系统公告
import InfoCenter from '@/components/infoCenter/InfoCenter' // 信息中心
import VersionUpSet from '@/components/versionUpSet/VersionUpSet' // 客户端版本设置
import SmsUpSet from '@/components/sms/smsUpSet' // 短信接口设置
import UserMsgManage from '@/components/userMsgManage/UserMsgManage' // 用户消息管理
import UserLog from '@/components/user/UserLog' // 用户日志
Vue.use(Router)

export default new Router({
  //mode: 'history',
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/',
      name: 'Home',
      component: Home,
      children:[
        {
          path: '/', 
          component: Index,
           name: '首页'
        },
        {
          path: '/AdminManage', 
          component: AdminManage,
           name: '管理员管理'
        },
        {
          path: '/MenuManage',
           component: MenuManage,
            name: '权限规则管理'
          },
        {
          path: '/RoleManage',
           component: RoleManage,
            name: '角色管理'
          },
          {
          path: '/SystemLog',
           component: SystemLog,
            name: '系统日志'
        },
        {
          path: '/SystemSet',
           component: SystemSet,
            name: '系统设置'
        },
        {
          path: '/GroupList',
           component: GroupList,
            name: '群组列表'
        },
        {
          path: '/MenusManage',
           component: MenusManage,
            name: '菜单管理'
        },
        {
          path: '/UserList',
           component: UserList,
            name: '用户列表'
        },
        {
          path: '/TabbarSet',
           component: TabbarSet,
            name: 'Tabbar栏设置'
        },
        {
          path: '/ChatSet',
           component: ChatSet,
            name: '聊天设置'
        },
        {
          path: '/CrossSet',
           component: CrossSet,
            name: '跨域设置'
        },
        {
          path: '/serviceChatSet',
          component: serviceChatSet,
          name: '客服小蜜自动回复'
        },
        {
          path: '/Notice',
          component: Notice,
          name: '系统公告'
        },
        {
          path: '/InfoCenter',
          component: InfoCenter,
          name: '信息中心'
        },
        {
          path: '/VersionUpSet',
          component: VersionUpSet,
          name: '客户端版本设置'
        },
        {
          path: '/AccountAdd',
          component: AccountAdd,
          name: '添加用户'
        },
        {
          path: '/SmsUpSet',
          component: SmsUpSet,
          name: '短信接口设置'
        },
        {
          path: '/UserMsgManage',
          component: UserMsgManage,
          name: '用户消息管理'
        },
        {
          path: '/UserLog',
          component: UserLog,
          name: '用户日志'
        },
      ]
    }
  ]
})
