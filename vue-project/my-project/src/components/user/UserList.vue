<template>
  <div class="userlist">
    <template>
      <el-form :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item label="用户账号">
          <el-input v-model="formInline.u_login_id" clearable placeholder="输入用户账号"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">查询</el-button>
        </el-form-item>
      </el-form>
    </template>
    <template>
      <el-button id="move" type="info" @click="a">备用按钮</el-button>
      <el-table
        v-loading="loading"
        element-loading-text="拼命加载中"
        element-loading-spinner="el-icon-loading"
        :data="tableData"
        border
        style="width: 100%"
        height="678"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="u_id" sortable label="ID" width="80"></el-table-column>
        <el-table-column label="头像" width="80">
          <template scope="scope">
            <img :src="scope.row.u_headportrait" width="40" height="40" class="head_pic" />
          </template>
        </el-table-column>
        <el-table-column prop="u_login_id" label="账号"></el-table-column>
        <el-table-column label="密码">
          <template scope="scope">
            <el-button type="info" size="mini" @click="upPassword(scope.row.u_id)" round>重置密码</el-button>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="u_nickname" label="用户昵称"></el-table-column> -->
        <el-table-column width="100" label="用户类型">
          <template slot-scope="scope">
            <el-tag effect="dark" :type="scope.row.u_agent==1?'success':scope.row.u_agent==0?'info':''">
              {{scope.row.u_agent==0?'普通':'客服'}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="friend_count" width="80" label="好友数"></el-table-column>
        <el-table-column label="邀请码">
          <template slot-scope="scope">
            {{scope.row.u_code}}
            <el-button
              type="info"
              size="mini"
              icon="el-icon-edit"
              @click="upCode(scope.row.u_id)"
              class="code"
              circle
            ></el-button>
          </template>
        </el-table-column>
        <el-table-column prop="update_time" width="180" label="最后登录时间"></el-table-column>
        <el-table-column width="150" label="邀请人账号">
          <template scope="scope">
            <span v-if="scope.row.u_inviter_id != null">{{scope.row.u_inviter_id.u_login_id}}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="u_login_ip.ip" width="150" label="登录IP"></el-table-column>

        <el-table-column width="330" label="操作">
          <template slot-scope="scope">
            <el-button plain v-if="!scope.row.u_login_ip" disabled>没有IP</el-button>

            <el-button
              size="mini"
              v-else-if="scope.row.u_login_ip.status == 1"
              type="warning"
              @click="handleBanned(scope.row.u_id, scope.row.u_login_ip.ip)"
            >封禁IP</el-button>
            <el-button
              size="mini"
              v-else-if="scope.row.u_login_ip.status == 2"
              @click="handleBan(scope.row.u_id, scope.row.u_login_ip.ip)"
            >解禁IP</el-button>

            <el-button
              size="mini"
              v-if="scope.row.status == 1"
              type="danger"
              @click="handleBannedUser(scope.row.u_id)"
            >禁用用户</el-button>
            <el-button
              size="mini"
              v-else-if="scope.row.status == 2"
              @click="handleBanUser(scope.row.u_id)"
            >解冻用户</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-sizes="pagesizes"
        :page-size="pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </template>
  </div>
</template>

<script>
import md5 from "js-md5";
export default {
  name: "UserList",
  data() {
    return {
      tableData: [],
      admin_id: sessionStorage.getItem("admin_id"),
      token: sessionStorage.getItem(
        sessionStorage.getItem("admin_id") + "token"
      ),
      total: "",
      currentPage: 1, //初始页
      pagesize: 10, // 每页的数据
      pagesizes: [10, 50, 100, 200], // 可选每页显示多少条
      search: "",

      multipleSelection: [], // 多选框
      dialogFormVisible: false,
      formLabelWidth: "80px",
      form: {
        region: ""
      },
      agentList: [],
      formInline: {
        u_login_id: "" // 用户账号
        //date: '' // 创建时间
      },
      minId: 1,
      userCount: 0,
      loading: true
    };
  },
  methods: {
    localData() {
      var params = {
        admin_id: this.admin_id,
        token: this.token
      };
      var adminUrl = this.Api + "User/getUserInfo"; // 获取用户列表
      this.$axios
        .post(adminUrl, this.$qs.stringify(params))
        .then(response => {
          switch (response.data.code) {
            case 200:
              // this.userCount = response.data.userCount;
              this.total = response.data.total;
              this.tableData = this.sortByKey(response.data.userInfo, "u_id");
              this.loading = false;
              break;
            case 40001: // 普通提醒状态
              this.$message({
                showClose: true,
                type: "warning",
                message: response.data.msg
              });
              this.loading = false;
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
          console.log(response.data);
        })
        .catch(error => {
          console.log(error);
        });
    },
    // 数组对象排序  array数组  key 数组对象中的key 升序降序修改大于小于号
    sortByKey(array, key) {
      return array.sort(function(a, b) {
        var x = a[key];
        var y = b[key];
        return x > y ? -1 : x < y ? 1 : 0;
      });
    },
    // 多选框
    handleSelectionChange(val) {
      this.multipleSelection = [];
      for (var item in val) {
        this.multipleSelection.push(val[item].u_id);
      }
      console.log(this.multipleSelection);
    },
   
    // 重置密码
    upPassword(uid) {
      this.$prompt("请输入密码", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$/,
        inputErrorMessage: "密码必须是数字加字母6到16位"
      })
        .then(({ value }) => {
          var url = this.Api + "User/upPassword";
          var params = {
            admin_id: this.admin_id,
            token: this.token,
            u_id: uid,
            u_password: md5(value)
          };
          this.$axios
            .post(url, this.$qs.stringify(params))
            .then(response => {
              switch (response.data.code) {
                case 200:
                  this.$message({
                    type: "success",
                    message: response.data.msg
                  });
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
              console.log(response.data);
            })
            .catch(error => {
              console.log(error);
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "取消输入"
          });
        });
    },
    // 升级代理、降级普通 用户
    upAgent(u_id, u_agent) {
      var url = this.Api + "User/upAgent";
      var params = {
        admin_id: this.admin_id,
        token: this.token,
        u_id: u_id,
        u_agent: u_agent
      };
      this.$axios
        .post(url, this.$qs.stringify(params))
        .then(response => {
          switch (response.data.code) {
            case 200:
              this.$message({
                type: "success",
                message: response.data.msg
              });
              this.tableData.forEach(element => {
                if(element.u_id == u_id){
                  element.u_agent = u_agent;
                }
              });
              break;
            case 40001:
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
          console.log(response.data);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "取消输入"
          });
        });
    },
    // 修改邀请码
    upCode(uid) {
      this.$prompt("请输入邀请码", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /[0-9A-Za-z]{5,10}$/,
        inputErrorMessage: "验证码必须是数字和字母6-10位"
      })
        .then(({ value }) => {
          var url = this.Api + "User/upCode";
          var params = {
            admin_id: this.admin_id,
            token: this.token,
            u_id: uid,
            u_code: value
          };
          this.$axios
            .post(url, this.$qs.stringify(params))
            .then(response => {
              switch (response.data.code) {
                case 200:
                  this.$message({
                    type: "success",
                    message: response.data.msg
                  });
                  this.localData();
                  break;
                case 40001:
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
              console.log(response.data);
            })
            .catch(error => {
              console.log(error);
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "取消输入"
          });
        });
    },
    // 封禁用户IP
    handleBanned(u_id, u_login_ip) {
      this.$confirm("确定要封禁用户此IP吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          var url = this.Api + "User/bannedIp";
          var params = {
            admin_id: this.admin_id,
            token: this.token,
            u_id: u_id,
            u_login_ip: u_login_ip,
            scope: "banned"
          };
          this.$axios
            .post(url, this.$qs.stringify(params))
            .then(response => {
              switch (response.data.code) {
                case 200:
                  this.$message({
                    type: "success",
                    message: response.data.msg
                  });
                  // 成功后重新加载
                  this.localData();
                  break;
                case 40001:
                  this.$message({
                    type: "error",
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
            .catch(error => {
              console.log(error);
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
      console.log(u_id, u_login_ip);
    },
    // 解禁用户IP
    handleBan(u_id, u_login_ip) {
      this.$confirm("确定要解禁用户此IP吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          var url = this.Api + "User/bannedIp";
          var params = {
            admin_id: this.admin_id,
            token: this.token,
            u_id: u_id,
            u_login_ip: u_login_ip,
            scope: "ban"
          };
          this.$axios
            .post(url, this.$qs.stringify(params))
            .then(response => {
              switch (response.data.code) {
                case 200:
                  this.$message({
                    type: "success",
                    message: response.data.msg
                  });
                  // 成功后重新加载
                  this.localData();
                  break;
                case 40001:
                  this.$message({
                    type: "error",
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
            .catch(error => {
              console.log(error);
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
      console.log(u_id, u_login_ip);
    },
    // 禁用用户
    handleBannedUser(u_id) {
      this.$confirm("确定要禁用该用户吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          var url = this.Api + "User/bannedUser";
          var params = {
            admin_id: this.admin_id,
            token: this.token,
            u_id: u_id,
            scope: "banned"
          };
          this.$axios
            .post(url, this.$qs.stringify(params))
            .then(response => {
              switch (response.data.code) {
                case 200:
                  this.$message({
                    type: "success",
                    message: response.data.msg
                  });
                  // 成功后重新加载
                  this.localData();
                  break;
                case 40001:
                  this.$message({
                    type: "error",
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
            .catch(error => {
              console.log(error);
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
      console.log(u_id);
    },
    // 解禁用户
    handleBanUser(u_id) {
      this.$confirm("确定要解禁该用户吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          var url = this.Api + "User/bannedUser";
          var params = {
            admin_id: this.admin_id,
            token: this.token,
            u_id: u_id,
            scope: "ban"
          };
          this.$axios
            .post(url, this.$qs.stringify(params))
            .then(response => {
              switch (response.data.code) {
                case 200:
                  this.$message({
                    type: "success",
                    message: response.data.msg
                  });
                  // 成功后重新加载
                  this.localData();
                  break;
                case 40001:
                  this.$message({
                    type: "error",
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
            .catch(error => {
              console.log(error);
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
      console.log(u_id);
    },
    handleSizeChange(val) {
      this.pagesize = val;
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      console.log(`当前页: ${val}`);
      var offset = this.currentPage * this.pagesize - this.pagesize;
      var params = {
        admin_id: this.admin_id,
        token: this.token,
        offset: offset,
        length: this.pagesize,
        u_login_id: this.formInline.u_login_id // 用户账号
      };

      
        var adminUrl = this.Api + "User/getUserInfo"; // 获取用户列表
      

      this.$axios
        .post(adminUrl, this.$qs.stringify(params))
        .then(response => {
          this.tableData = this.sortByKey(response.data.userInfo, "u_id");

          console.log(this.tableData);
        })
        .catch(error => {
          console.log(error);
        });
    },
    // 查询
    onSubmit() {
      if(this.formInline.u_login_id == ''){
        this.$message({
                showClose: true,
                type: "warning",
                message: '参数不能为空'
              });
              return ;
      }
      this.tableData = [];
      this.total = "";
      // var dateStart = new Date(this.formInline.date[0]);
      // var dateEnd   = new Date(this.formInline.date[1]);
      this.loading = true;
      var url = this.Api + "User/searchUserInfo";
      var params = {
        admin_id: this.admin_id,
        token: this.token,
        u_login_id: this.formInline.u_login_id // 用户账号
        // startTime: Date.parse(dateStart)/1000, // 开始时间
        // endTime: Date.parse(dateEnd)/1000 // 结束时间
      };
      this.$axios
        .post(url, this.$qs.stringify(params))
        .then(response => {
          switch (response.data.code) {
            case 200:
              this.total = response.data.total;
              this.tableData = this.sortByKey(response.data.userInfo, "u_id");
              this.loading = false;
              break;
            case 40001:
              this.$message({
                type: "error",
                message: response.data.msg
              });
              this.loading = false;
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
              this.loading = false;
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
    }
  },
  created() {
    if (!this.admin_id || !this.token) {
      this.$router.push({ path: "/Login" });
    }
    this.localData();
  }
};
</script>
<style scoped>
.code {
  float: right;
}
#move {
  float: left;
}
</style>
