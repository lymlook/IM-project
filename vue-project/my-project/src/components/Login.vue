<template>
  <div class="Login">
    <div id="login">
      <div class="title-text">管理员登录</div>
      <div>
        <el-form
          :model="ruleForm"
          status-icon
          :rules="rules"
          ref="ruleForm"
          label-width="100px"
          class="demo-ruleForm"
        >
          <el-form-item label="用户名:" prop="adminName">
            <el-input type="text" v-model="ruleForm.adminName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="密码:" prop="password">
            <el-input type="password" v-model="ruleForm.password" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="验证码:" prop="captcha">
            <el-input v-model="ruleForm.captcha"></el-input>
          </el-form-item>
          <el-form-item>
            <span @click="changeImgCode" style="width:160px;">
              <img :src="imgCode" alt="验证码" />点击刷新
            </span>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
            <el-button @click="resetForm('ruleForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import md5 from "js-md5";
export default {
  name: "Login",
  data() {
    var checkCode = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("验证码不能为空"));
      } else {
        callback();
      }
    };
    var checkName = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入用户名"));
      } else {
        callback();
      }
    };
    var checkPass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else {
        callback();
      }
    };
    return {
      ruleForm: {
        adminName: "",
        password: "",
        captcha: "",
      },
      imgCode: this.Api + "Login/verify?num=" + Math.random(),
      rules: {
        adminName: [{ validator: checkName, trigger: "blur" }],
        password: [{ validator: checkPass, trigger: "blur" }],
        captcha: [{ validator: checkCode, trigger: "blur" }],
      },
    };
  },
  created: function () {
    
   //this.getImgCode();
    
  },
  methods: {
    getImgCode() {
      //var url = this.Api + "Login/authToken"; // 
      var url = this.Api + "Login/verify"; // 
      var data = {
        token:  this.newGuid(),
        _t: Math.random()
      }
      this.$axios
        .post(url, this.$qs.stringify(data))
        .then((response) => {
          this.imgCode = response.data;
          console.log(response.headers.Set-Cookie);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    submitForm(formName) {
      var that = this;

      that.$refs[formName].validate((valid) => {
        if (valid) {
          var url = that.Api + "Login/loginCheck"; // 登录验证
          var data = {
            adminName: that.ruleForm.adminName,
            password: md5(that.ruleForm.password),
            captcha: that.ruleForm.captcha
          };
          console.log(data);
          that.$axios
            .post(url, that.$qs.stringify(data))
            .then((response) => {
              var admin_id = response.data.admin_id;
              var token = response.data.token;
              var is_admin = response.data.is_admin;
              sessionStorage.setItem("admin_id", admin_id);
              sessionStorage.setItem(admin_id + "token", token);
              sessionStorage.setItem("is_admin", is_admin);
              var res = response.data.re;

              //console.log(res)
              switch (res) {
                case 200:
                  // that.$message({
                  //   message: response.data.msg,
                  //   type: "success"
                  // });
                  that.$router.push({ path: "/" });
                  break;
                case 40001:
                  this.changeImgCode();
                  that.$message.error(response.data.msg);
                  break;
                case 40002: //token验证失败
                  this.$message({
                    showClose: true,
                    type: "warning",
                    message: response.data.msg,
                  });
                  setTimeout(() => {
                    this.$router.push({ path: "/login" });
                  }, 1500);
                  break;
                case 40003: //未登录状态
                  this.$message({
                    showClose: true,
                    type: "warning",
                    message: response.data.msg,
                  });
                  setTimeout(() => {
                    this.$router.push({ path: "/login" });
                  }, 1500);
                  break;
                case 405: //没有权限
                  this.$message({
                    showClose: true,
                    type: "warning",
                    message: response.data.msg,
                  });
                  break;
                case 302: //唯一登录
                  this.$message({
                    showClose: true,
                    type: "warning",
                    message: response.data.msg,
                  });
                  setTimeout(() => {
                    this.$router.push({ path: "/login" });
                  }, 1500);
                  break;
              }

              //console.log(response.data)
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          console.log("error submit!!");

          return false;
        }
      });
    },

    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    // 点击图片修改图片src
    changeImgCode() {
      this.imgCode = this.Api + "Login/verify?num=" + Math.random();
      
    },
    newGuid() {
      var guid = "";
      for (var i = 1; i <= 32; i++) {
        var n = Math.floor(Math.random() * 16.0).toString(16);
        guid += n;
        if (i == 8 || i == 12 || i == 16 || i == 20) guid += "-";
      }
      sessionStorage.setItem("auth_token", guid);
      return guid;
    },
  },
};
</script>

<style scoped>
#login {
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -280px;
  margin-top: -20px;
  width: 500px;
  height: 400px;
  background: #ecf1ef;
}
.title-text {
  height: 50px;
  background-color: rgb(26, 24, 24);
  font-size: 35px;
  color: aliceblue;
}

.demo-ruleForm {
  margin: 30px;
}
</style>
