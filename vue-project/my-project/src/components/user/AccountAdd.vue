<template>
  <div class="AccountAdd">
    <el-tabs :tab-position="tabPosition">
      <el-tab-pane label="添加代理账号">
        <el-form
          ref="ruleForm"
          :model="ruleForm"
          status-icon
          :rules="rules"
          id="form"
          label-width="160px"
          class="demo-ruleForm"
        >
          <el-form-item label="账号类型：">
            <template>
              <el-radio v-model="ruleForm.u_agent" :label="0">普通账号</el-radio>
              <el-radio v-model="ruleForm.u_agent" :label="2">客服账号</el-radio>
            </template>
          </el-form-item>
          <el-form-item label="账号：" prop="u_login_id">
            <el-input v-model="ruleForm.u_login_id" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="u_password">
            <el-input type="password" v-model="ruleForm.u_password" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="check_u_password">
            <el-input type="password" v-model="ruleForm.check_u_password" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
            <el-button @click="resetForm('ruleForm')">重置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <!-- <el-tab-pane label="添加客服账号"></el-tab-pane>
      <el-tab-pane label="添加客服账号"></el-tab-pane>-->
    </el-tabs>
  </div>
</template>

<script>
import md5 from "js-md5";
export default {
  name: "AccountAdd",
  data() {
    var validateLoginId = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入账号"));
      } else {
        if (!/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,10}$/.test(value)) {
          callback(new Error("账号必须是字母加数字6-10位"));
        }
        callback();
      }
    };
    var validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else {
        if (this.ruleForm.check_u_password !== "") {
          this.$refs.ruleForm.validateField("check_u_password");
        }
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.ruleForm.u_password) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };

    return {
      tabPosition: "top",
      options: [],
      ruleForm: {
        u_login_id: "", // 账号
        u_password: "", // 密码
        check_u_password: "",
        u_inviter_id: "", // 上级代理id
        u_agent: 1
      },
      rules: {
        u_login_id: [
          {
            required: true,
            validator: validateLoginId,
            trigger: "blur"
          }
        ],
        u_password: [
          {
            required: true,
            validator: validatePass,
            trigger: "blur"
          }
        ],
        check_u_password: [
          {
            required: true,
            validator: validatePass2,
            trigger: "blur"
          }
        ]
      },
      admin_id: sessionStorage.getItem("admin_id"),
      token: sessionStorage.getItem(
        sessionStorage.getItem("admin_id") + "token"
      ),
      platforms: [],
      is_admin: sessionStorage.getItem("is_admin"),
    };
  },
  created() {
    if (!this.admin_id || !this.token) {
      this.$router.push({ path: "/Login" });
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$confirm("确定提交吗？", "提示", {}).then(() => {
            var params = {
              admin_id: this.admin_id,
              token: this.token,
              u_agent: this.ruleForm.u_agent,
              u_login_id: this.ruleForm.u_login_id, // 账号
              u_password: md5(this.ruleForm.u_password), // 密码
            };
            console.log(params);
            var url = this.Api + "User/accountAdd";
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
                    this.ruleForm.u_login_id = "";
                    this.ruleForm.u_password = "";
                    this.ruleForm.u_inviter_id = "";
                    this.ruleForm.check_u_password = "";
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
                  console.log(error);
                  this.$notify.error({
                    title: "错误",
                    message: "错误：请检查网络"
                  });
                }.bind(this)
              );
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    }
  }
};
</script>
<style scoped>
#form {
  margin: auto;
  width: 40%;
}
</style>