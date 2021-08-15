<template>
  <div id="Home">
    <el-container>
      <el-header>
        <!-- 菜单栏开始 -->
        <el-menu
          :default-active="this.$router.path"
          :data="data"
          router
          class="el-menu"
          mode="horizontal"
          @select="handleSelect"
          text-color="#fff"
          active-text-color="#ffd04b"
          background-color="#333"
        >
          <!-- 菜单开始 -->
          <el-menu-item index="/" v-on:click="bread('首页', '')">首页</el-menu-item>
          <el-submenu
            v-for="(item, index) in data.menuList"
            :key="item.menu_id+'-label'"
            v-bind:index="index+''"
          >
            <template slot="title">{{item.name}}</template>
            <el-menu-item
              v-for="(childItem) in item.child"
              :key="childItem.menu_id+''"
              v-bind:index="childItem.url"
              v-on:click="bread(item.name?item.name:'首页', childItem.name?childItem.name:'')"
            >{{childItem.name}}</el-menu-item>
          </el-submenu>
          <!-- 菜单结束 -->

          <!-- 右上角管理员登录状态开始 -->
          <label
            v-for="(item, index) in data.adminInfo"
            :key="item.admin_id+''"
            v-bind:index="index+''"
          >
            <span class="topright">{{item.name}}</span>

            <label
              v-for="(rolesitem, index) in item.roles"
              :key="rolesitem.admin_id+''"
              v-bind:index="index+''"
            >
              <span class="topright">{{rolesitem.name}}</span>
            </label>
          </label>
          <el-dropdown class="topright">
            <i class="el-icon-setting"></i>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <el-button @click="upPwd()">修改密码</el-button>
              </el-dropdown-item>
              <el-dropdown-item>
                <el-button @click="logOut()">退出登录</el-button>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <!-- 右上角管理员登录状态结束 -->
        </el-menu>
        <!-- 菜单栏结束 -->
      </el-header>

      <!-- 面包屑开始 -->
      <div class="breadcrumb">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item>{{item}}</el-breadcrumb-item>
          <el-breadcrumb-item>{{childItem}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <!-- 面包屑结束 -->

      <el-main>
        <router-view />
      </el-main>
    </el-container>
    <el-dialog title="修改密码" width="30%" :visible.sync="dialogFormVisible">
      <el-form
        :model="ruleForm"
        status-icon
        :rules="rules"
        ref="ruleForm"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="旧密码" prop="pwd">
          <el-input type="password" v-model.number="ruleForm.pwd"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="pass">
          <el-input type="password" v-model="ruleForm.pass" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="checkPass">
          <el-input type="password" v-model="ruleForm.checkPass" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
          <el-button @click="resetForm('ruleForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import md5 from "js-md5";
export default {
  name: "Home",

  data() {
    var checkPwd = (rule, value, callback) => {
      if (value === "") {
        return callback(new Error("密码不能为空"));
      }
      callback();
    };
    var validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入新密码"));
      } else {
        if (this.ruleForm.checkPass !== "") {
          this.$refs.ruleForm.validateField("checkPass");
        }
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入新密码"));
      } else if (value !== this.ruleForm.pass) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      data: {
        menuList: "",
        adminInfo: ""
      },
      item: "",
      childItem: "",
      dialogFormVisible: false,
      ruleForm: {
        pass: "",
        checkPass: "",
        pwd: ""
      },
      rules: {
        pass: [{ validator: validatePass, trigger: "blur" }],
        checkPass: [{ validator: validatePass2, trigger: "blur" }],
        pwd: [{ validator: checkPwd, trigger: "blur" }]
      },
      admin_id: sessionStorage.getItem("admin_id"),
      token: sessionStorage.getItem(
        sessionStorage.getItem("admin_id") + "token"
      )
    };
  },

  methods: {
    loadData() {
      var adminUrl = this.Api + "Index/index"; // 获取管理员登录信息
      var menusUrl = this.Api + "Menus/Menus"; // 获取菜单列表
      this.axios
        .get(adminUrl)
        .then(response => {
          this.data.adminInfo = response.data.adminInfo;

          if (!this.data.adminInfo) {
            // 请求信息为false  清楚cookie 并跳转到 登录页

            sessionStorage.removeItem(this.admin + "token"),
              this.$router.push({ path: "/login" });
          }
          console.log(response.data);
        })
        .catch(error => {
          console.log(error);
        }),
        this.axios
          .get(menusUrl)
          .then(response => {
            this.data.menuList = response.data.menuList;

            console.log(response.data);

            switch (response.data.code) {
              case 40002: //token验证失败
                this.$message({
                  showClose: true,
                  type: "warning",
                  message: response.data.msg
                });
                setTimeout(() => {
                  this.$router.push({ path: "/login" });
                }, 1500);
                break;
              case 40003: //未登录状态
                this.$message({
                  showClose: true,
                  type: "warning",
                  message: response.data.msg
                });
                setTimeout(() => {
                  this.$router.push({ path: "/login" });
                }, 1500);
                break;
              case 405: //没有权限
                this.$message({
                  showClose: true,
                  type: "warning",
                  message: response.data.msg
                });
                break;
              case 302: //唯一登录
                this.$message({
                  showClose: true,
                  type: "warning",
                  message: response.data.msg
                });
                setTimeout(() => {
                  this.$router.push({ path: "/login" });
                }, 1500);
                break;
            }
          })
          .catch(error => {
            console.log(error);
          });
    },
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
    bread(item, childItem) {
      this.item = item;
      this.childItem = childItem;
    },
    // 退出登入
    logOut() {
      var url = this.Api + "Index/logOut";
      var param = {
        admin_id: this.admin_id,
        token: this.token
      };
      this.$axios
        .post(url, this.$qs.stringify(param))
        .then(response => {
          
        })
        .catch(error => {
          console.log(error);
        });
      sessionStorage.clear();
      this.$router.push({ path: "/login" });
     
    },
    // 修改密码
    upPwd() {
      this.dialogFormVisible = true;
    },
    // 提交
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          var params = {
            admin_id: this.admin_id,
            token: this.token,
            oldPwd: md5(String(this.ruleForm.pwd)),
            newPass: md5(this.ruleForm.pass)
          };
          console.log(params);
          var url = this.Api + "Admin/upPwd";
          this.$axios
            .post(url, this.$qs.stringify(params))
            .then(response => {
              switch (response.data.code) {
                case 200:
                  this.$message({
                    showClose: true,
                    type: "success",
                    message: response.data.msg
                  });
                  this.dialogFormVisible = false;
                  break;
                case 40001: // 普通提醒状态
                  this.$message({
                    showClose: true,
                    type: "warning",
                    message: response.data.msg
                  });
                  break;
                case 40002: //token验证失败
                  this.$message({
                    showClose: true,
                    type: "warning",
                    message: response.data.msg
                  });
                  setTimeout(() => {
                    this.$router.push({ path: "/login" });
                  }, 1500);
                  break;
                case 40003: //未登录状态
                  this.$message({
                    showClose: true,
                    type: "warning",
                    message: response.data.msg
                  });
                  setTimeout(() => {
                    this.$router.push({ path: "/login" });
                  }, 1500);
                  break;
                case 405: //没有权限
                  this.$message({
                    showClose: true,
                    type: "warning",
                    message: response.data.msg
                  });
                  break;
                case 302: //唯一登录
                  this.$message({
                    showClose: true,
                    type: "warning",
                    message: response.data.msg
                  });
                  setTimeout(() => {
                    this.$router.push({ path: "/login" });
                  }, 1500);
                  break;
              }
            })
            // 请求error
            .catch(
              function(error) {
                this.$notify.error({
                  title: "错误",
                  message: "错误：请检查网络"
                });
              }.bind(this)
            );
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    // 重置
    resetForm(formName) {
      this.$refs[formName].resetFields();
    }
  },
  created: function() {
    if (!this.admin_id || !this.token) {
      this.$router.push({ path: "/Login" });
    }
    this.loadData();
  }
};
</script>

<style scoped>
.el-header {
  background-color: #333;
  color: #333;
  text-align: center;
  line-height: 60px;
}

.el-main {
  background-color: #e9eef3;
  color: #333;
  text-align: center;
  line-height: 100%;
}

.topright {
  color: #e9eef3;
  float: right;
  margin-right: 15px;
}

.breadcrumb {
  margin-top: 5px;
  background-color: #ffffff;
  height: 20px;
  font-size: 20px;
}
</style>
