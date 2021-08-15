<template>
  <div class="smsUpSet">
    <!-- <el-button id="add" type="primary" @click="dictionaryAdd()">增加</el-button> -->
    <el-table :data="tableData" border stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="url" label="接口地址"></el-table-column>
      <el-table-column label="状态" width="100">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="left">
            <p>点击切换状态</p>
            <div slot="reference" class="name-wrapper">
              <el-button
                size="mini"
                v-if="scope.row.status == 1"
                type="primary"
                @click="editState(scope.row.id,status=0)"
              >已启用</el-button>
              <el-button
                size="mini"
                v-if="scope.row.status == 0"
                type="danger"
                @click="editState(scope.row.id,status=1)"
              >未启用</el-button>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="备注"></el-table-column>
      <el-table-column prop="create_time" label="创建时间" width="200"></el-table-column>
      <el-table-column label="操作" width="280">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="parameterSet(scope.row.id)">参数配置</el-button>
          <el-button size="mini" @click="handleEdit(scope.row.id, scope.row)">编辑</el-button>
          <!-- <el-button size="mini" type="danger" @click="handleDelete(scope.row.id, scope.row)">删除</el-button> -->
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增界面 -->
    <el-dialog title="新增" :visible.sync="addFormVisible" width="35%">
      <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
        <el-form-item label="接口地址" prop="url">
          <el-input v-model="addForm.url" auto-complete="off" placeholder="请输入接口域名"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="description">
          <el-input
            type="textarea"
            :rows="2"
            placeholder="请输入内容"
            v-model="addForm.description"
            auto-complete="off"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
      </div>
    </el-dialog>

    <!--编辑界面-->
    <el-dialog title="编辑" :visible.sync="editFormVisible" width="35%">
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
        <el-form-item label="接口地址" prop="title">
          <el-input v-model="editForm.url" auto-complete="off" placeholder="请输入接口域名"></el-input>
        </el-form-item>

        <el-form-item label="备注" prop="content">
          <el-input
            type="textarea"
            :rows="2"
            placeholder="请输入内容"
            v-model="editForm.description"
            auto-complete="off"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
      </div>
    </el-dialog>

    <!-- 参数配置 -->
    <el-dialog title="参数配置" :visible.sync="dialogFormVisible" width="40%">
      <el-form label-width="100px" class="demo-ruleForm">
        <div v-for="(item,index) in smsConf" :key="index">
          <el-form-item :label="item.key" :prop="item.key">
            <el-input v-model="item.value"></el-input>
            <span id="span">{{item.describe}}</span>
          </el-form-item>
        </div>
        <el-form-item>
          <el-button @click.native="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm()">提交</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "ChatSet",
  data() {
    return {
      tableData: [],

      //新增界面是否显示
      addFormVisible: false,
      addLoading: false,
      addFormRules: {
        url: [
          {
            required: true,
            message: "请输入接口域名",
            trigger: "blur"
          }
        ]
      },
      //新增界面数据
      addForm: {
        url: "",
        description: ""
      },

      //编辑界面是否显示
      editFormVisible: false,
      editLoading: false,
      editFormRules: {
        url: [
          {
            required: true,
            message: "请输入接口域名",
            trigger: "blur"
          }
        ]
      },
      //编辑界面数据
      editForm: {
        url: "",
        description: "",
        id: ""
      },

      // 参数配置

      dialogFormVisible: false,
      smsConf: [],
      interface_id: "",

      admin_id: sessionStorage.getItem("admin_id"),
      token: sessionStorage.getItem(
        sessionStorage.getItem("admin_id") + "token"
      ),
    };
  },
  created() {
    if (!this.admin_id || !this.token) {
      this.$router.push({ path: "/Login" });
    }
    this.loadData();
  },
  methods: {
    loadData() {
      var params = {
        admin_id: this.admin_id,
        token: this.token
      };
      var url = this.Api + "Sms/postSms";
      this.$axios
        .post(url, this.$qs.stringify(params))
        .then(response => {
          console.log(response.data);
          switch (response.data.code) {
            case 200:
              this.tableData = response.data.data;
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
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    // 增加短信服务商接口
    dictionaryAdd() {
      this.addFormVisible = true;
    },
    addSubmit() {
      this.$refs.addForm.validate(valid => {
        if (valid) {
          //判断是否填写完整  --true
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.addLoading = true;
            var params = {
              admin_id: this.admin_id,
              token: this.token,
              url: this.addForm.url,
              description: this.addForm.description
            };
            // 发保存请求
            var url = this.Api + "Sms/addSms"; // 新增
            this.$axios
              .post(url, this.$qs.stringify(params))
              .then(response => {
                this.addLoading = false;
                switch (response.data.code) {
                  case 200:
                    // 表单重置
                    this.$refs["addForm"].resetFields();
                    this.addFormVisible = false;
                    this.loadData();
                    this.$message({
                      showClose: true,
                      type: "success",
                      message: response.data.msg
                    });
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
              // 请求error
              .catch(
                function(error) {
                  this.$notify.error({
                    title: "错误",
                    message: "错误：请检查网络"
                  });
                }.bind(this)
              );
          });
        }
      });
    },
    // 编辑短信服务商接口
    handleEdit(index, row) {
      console.log(Object.assign({}, row));
      var obj = Object.assign({}, row);
      this.editFormVisible = true;
      this.editForm = obj;
      this.editForm.id = index;
      console.log(index, row);
    },
    editSubmit() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          //判断是否填写完整  --true
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.editLoading = true;
            var params = {
              admin_id: this.admin_id,
              token: this.token,
              url: this.editForm.url,
              description: this.editForm.description,
              id: this.editForm.id
            };

            // 发保存请求
            var url = this.Api + "Sms/upSms";
            this.$axios
              .post(url, this.$qs.stringify(params))
              .then(response => {
                this.editLoading = false;
                switch (response.data.code) {
                  case 200:
                    // 表单重置
                    this.$refs["editForm"].resetFields();
                    this.editFormVisible = false;
                    this.loadData();

                    this.$message({
                      showClose: true,
                      type: "success",
                      message: response.data.msg
                    });
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
              // 请求error
              .catch(
                function(error) {
                  this.$notify.error({
                    title: "错误",
                    message: "错误：请检查网络"
                  });
                }.bind(this)
              );
          });
        }
      });
    },
    // 删除短信服务商接口
    handleDelete(index, row) {
      this.$confirm("确定删除吗？", "提示", {}).then(() => {
        var param = {
          id: index,
          admin_id: this.admin_id,
          token: this.token
        };
        var url = this.Api + "Sms/delSms"; // 删除
        this.$axios
          .post(url, this.$qs.stringify(param))
          .then(response => {
            switch (response.data.code) {
              case 200:
                this.loadData();
                this.$message({
                  showClose: true,
                  type: "success",
                  message: response.data.msg
                });
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
          // 请求error
          .catch(
            function(error) {
              this.$notify.error({
                title: "错误",
                message: "错误：请检查网络"
              });
            }.bind(this)
          );
      });
      console.log(index, row);
    },
    editState(id, status) {
      var params = {
        id: id,
        status: status,
        admin_id: this.admin_id,
        token: this.token
      };
      var url = this.Api + "Sms/upSmsStatus";
      this.$axios
        .post(url, this.$qs.stringify(params))
        .then(response => {
          this.addLoading = false;

          var code = response.data.code;
          switch (code) {
            case 200:
              this.loadData();
              this.$message({
                showClose: true,
                type: "success",
                message: response.data.msg
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
    },
    // 参数配置
    parameterSet(index) {
      this.dialogFormVisible = true;
      this.interface_id = index;
      var params = {
        admin_id: this.admin_id,
        token: this.token,
        p_id: index
      };
      var url = this.Api + "Sms/getSmsConf";
      this.$axios
        .post(url, this.$qs.stringify(params))
        .then(response => {
          console.log(response.data);
          switch (response.data.code) {
            case 200:
              this.smsConf = response.data.data.sms_conf;
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
      console.log(this.interface_id);
    },
    submitForm(formName) {
      this.$confirm("确认提交吗？", "提示", {}).then(() => {
        this.addLoading = true;
        var params = {
          admin_id: this.admin_id,
          token: this.token,
          interface_id: this.interface_id,
          data: this.smsConf
        };
        // 发保存请求
        var url = this.Api + "Sms/setSmsConf"; // 新增
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
          // 请求error
          .catch(
            function(error) {
              this.$notify.error({
                title: "错误",
                message: "错误：请检查网络"
              });
            }.bind(this)
          );
      });
    }
  }
};
</script>
<style scoped>
#form {
  margin: auto;
  width: 40%;
}
#add {
  float: left;
}
#span {
  float: left;
  color: rgb(224, 48, 48);
  font-size: 5px;
  height: 6px;
  margin-top: -10px;
}
</style>