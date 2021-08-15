<template>
  <div class="AdminManage">
    <template>
      <el-button id="add" type="primary" @click="handleAdd()">增加</el-button>

      <el-table
        :data="tableData.slice((currentPage-1)*pagesize,currentPage*pagesize)"
        height="750"
        stripe
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>

        <el-table-column prop="admin_id" label="ID" width="55"></el-table-column>

        <el-table-column prop="name" label="名称" width="150"></el-table-column>

        <el-table-column prop label="所属角色" width="180">
          <template slot-scope="scope">
            <span
              style="margin-left: 10px"
              v-for="item in scope.row.roles"
              :key="item+''"
            >{{ item.name }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="describe" label="描述" width="300"></el-table-column>

        <el-table-column prop="update_time" label="修改时间" width="200"></el-table-column>

        <el-table-column label="操作" width="300">
          <template slot-scope="scope" v-if="scope.row.is_admin !== 1">
            <el-button size="mini" @click="handleEdit(scope.row.admin_id, scope.row)">编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.row.admin_id, scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 50, 100, 200]"
        :page-size="pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="tableData.length"
      ></el-pagination>
    </template>
    <!-- 新增界面 -->
    <el-dialog title="新增" :visible.sync="addFormVisible" width="35%">
      <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
        <el-form-item label="用户名" prop="name">
          <el-input v-model="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="addForm.password" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色选择" prop="adminRole">
          <el-select v-model="addForm.adminRole" placeholder="请选择">
            <el-option
              v-for="item in roleOptions"
              :key="item.role_id"
              :label="item.name"
              :value="item.role_id"
              v-if="item.name !== '超级管理员'"
              auto-complete="off"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="describe">
          <el-input type="textarea" v-model="addForm.describe" auto-complete="off"></el-input>
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
        <el-form-item label="名称" prop="name">
          <el-input v-model="editForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <!-- <el-form-item label="旧密码" prop="passwordOld">
          <el-input type="password" v-model="editForm.passwordOld" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="passwordNew">
          <el-input type="password" v-model="editForm.passwordNew" auto-complete="off"></el-input>
        </el-form-item>-->
        <el-form-item label="角色选择" prop="adminRole">
          <el-select v-model="editForm.adminRole" placeholder="请选择">
            <el-option
              v-for="item in roleOptions"
              :key="item.role_id"
              :label="item.name"
              :value="item.role_id"
              v-if="item.name !== '超级管理员'"
              auto-complete="off"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="describe">
          <el-input v-model="editForm.describe" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
      </div>
    </el-dialog>
    <!--配置群主界面-->
    <el-dialog title="绑定群主" :visible.sync="agentFormVisible" width="35%">
      <el-form :model="agentForm" label-width="80px" :rules="agentFormRules" ref="agentForm">
        <el-form-item label="选择群主" prop="agentId">
          <el-select v-model="agentForm.agentId" multiple placeholder="请选择">
            <el-option
              v-for="item in agentList"
              :key="item.u_id"
              :label="item.u_login_id"
              :value="item.u_id"
              auto-complete="off"
            >
              <span style="float: left">{{ item.u_login_id }}</span>
              <span
                style="float: right; color: #8492a6; font-size: 13px"
              >{{ item.u_nickname?item.u_nickname:item.u_name }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="agentFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="agentSubmit" :loading="agentLoading">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import md5 from "js-md5";
export default {
  name: "AdminManage",
  data() {
    return {
      tableData: [],
      multipleSelection: [],
      currentPage: 1, //初始页
      pagesize: 10, //    每页的数据

      roleOptions: [], // 角色列表
      platformOptions: [], // 平台列表

      //编辑界面是否显示
      editFormVisible: false,
      editLoading: false,

      //编辑界面数据
      editForm: {
        name: "",
        // passwordOld: "",
        // passwordNew: "",
        adminRole: "",
        describe: "",
        adminId: "",
        platformId: ""
      },
      editFormRules: {
        name: [
          {
            required: true,
            message: "请输入角色名称",
            trigger: "blur"
          }
        ]
      },
      //新增界面是否显示
      addFormVisible: false,
      addLoading: false,
      addFormRules: {
        name: [
          {
            required: true,
            message: "请输入管理员名称",
            trigger: "blur"
          }
        ],
        password: [
          {
            required: true,
            message: "请输入密码",
            trigger: "blur"
          }
        ]
      },
      //新增界面数据
      addForm: {
        name: "",
        password: "",
        adminRole: "",
        describe: "",
        platformId: ""
      },
      agentList: "",
      //配置群主界面是否显示
      agentFormVisible: false,
      agentLoading: false,
      adminId: "",
      agentFormRules: {
        agentId: [
          {
            required: true,
            message: "请选择群主",
            trigger: "blur"
          }
        ]
      },
      // 配置群主数据
      agentForm: {
        agentId: ""
      },
      admin_id: sessionStorage.getItem("admin_id"),
      token: sessionStorage.getItem(
        sessionStorage.getItem("admin_id") + "token"
      ),
    };
  },
  methods: {
    loadData() {
     
      var adminUrl = this.Api + "Admin/lists"; // 获取管理员列表
      this.$axios
        .post(adminUrl, this.$qs.stringify())
        .then(response => {
          switch (response.data.code) {
            case 200:
              this.tableData = response.data.adminInfo;
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
              
              this.$router.push({ path: "/login" });
             
              break;
          }
          // console.log(response.data)
        })
        .catch(error => {
          console.log(error);
        });
    },
    getRoleInfo() {
      var roleUrl = this.Api + "Role/role";
      this.$axios
        .post(roleUrl, this.$qs.stringify())
        .then(response => {
          switch (response.data.code) {
            case 200:
              this.roleOptions = response.data.roleInfo;
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
          // console.log(response.data)
        })
        .catch(error => {
          console.log(error);
        });
    },
    
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
      console.log(this.multipleSelection);
    },
    
    handleDelete(index, row) {
      var param = {
        admin_id: this.admin_id,
        token: this.token,
        adminId: index
      };

      this.$confirm("确认删除吗？", "提示", {}).then(() => {
        var url = this.Api + "Admin/adminDelete";
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
      });
      console.log(index, row);
    },
    handleAdd() {
      this.addFormVisible = true;
      this.getRoleInfo();
    },
    handleEdit(index, row) {
      var obj = Object.assign({}, row);
      this.editFormVisible = true;
      this.editForm = obj;
      this.editForm.adminId = index;
      this.getRoleInfo();
      console.log('edit'+index,obj);
      //console.log(index, row);
    },
    editSubmit() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          //判断是否填写完整  --true
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.editLoading = true;
            var params = {
              adminId: this.editForm.adminId,
              adminName: this.editForm.name,
              // PasswordOld: md5(this.editForm.passwordOld),
              // passwordNew: md5(this.editForm.passwordNew),
              adminRoleId: this.editForm.adminRole,
              admin_id: this.admin_id,
              token: this.token,
              describe: this.editForm.describe,
            };
            // 发保存请求
            var url = this.Api + "Admin/updateAdmin";
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
        }
      });
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
              adminName: this.addForm.name,
              password: md5(this.addForm.password),
              describe: this.addForm.describe,
              adminRole: this.addForm.adminRole,
            };

            // 发保存请求
            var url = this.Api + "Admin/adminAdd";
            this.$axios
              .post(url, this.$qs.stringify(params))
              .then(response => {
                this.addLoading = false;
                switch (response.data.code) {
                  case 200:
                    this.$message({
                      showClose: true,
                      type: "success",
                      message: response.data.msg
                    });
                    // 表单重置
                    this.$refs["addForm"].resetFields();
                    this.addFormVisible = false;
                    this.loadData();
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
          });
        }
      });
    },
    agentSubmit() {
      this.$refs.agentForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.agentLoading = true;
            var params = {
              admin_id: this.admin_id,
              token: this.token,
              agentIds: this.agentForm.agentId,
              adminId: this.adminId
            };

            // 发保存请求
            var url = this.Api + "Admin/bindAgentUser";
            this.$axios
              .post(url, this.$qs.stringify(params))
              .then(response => {
                this.agentLoading = false;
                switch (response.data.code) {
                  case 200:
                    // 表单重置
                    this.$refs["agentForm"].resetFields();
                    this.agentFormVisible = false;
                    this.$message({
                      showClose: true,
                      type: "success",
                      message: response.data.msg
                    });
                    this.loadData();
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
          });
        }
      });
    },
    deleteRow(id) {
      this.$confirm("确认移除吗？", "提示", {}).then(() => {
        var params = {
          admin_id: this.admin_id,
          token: this.token,
          id: id
        };

        // 发保存请求
        var url = this.Api + "Admin/delBindAgentUser";
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
                this.loadData();
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
      });
    },
    handleSizeChange(val) {
      this.pagesize = val;
      //console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      //console.log(`当前页: ${val}`);
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
#add {
  float: left;
}
</style>
