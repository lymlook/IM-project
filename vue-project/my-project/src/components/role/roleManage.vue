<template>
  <div class="RoleManage">
    <template>
      <el-button id="add" type="primary" @click="handleAdd()">增加</el-button>
      <el-table
        :data="tableData.slice((currentPage-1)*pagesize,currentPage*pagesize)"
        stripe
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
        height="750"
      >
        <el-table-column type="selection" width="55"></el-table-column>

        <el-table-column label="ID" width="55">
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.role_id }}</span>
          </template>
        </el-table-column>

        <el-table-column label="角色名称" width="180">
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="角色成员">
          <template slot-scope="scope">
            <label v-for="item in scope.row.admins" :key="item+''">
              <span style="margin-left: 10px">{{ item.name }}</span>
            </label>
          </template>
        </el-table-column>
        <el-table-column label="描述">
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.describe }}</span>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="200">
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.create_time }}</span>
          </template>
        </el-table-column>

        <el-table-column label="修改时间" width="200">
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.update_time }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200">
          <template slot-scope="scope" v-if="scope.row.name !== '超级管理员'">
            <el-button size="mini" @click="handleEdit(scope.row.role_id, scope.row)">编辑</el-button>
            <el-button
              slot="reference"
              size="mini"
              type="danger"
              @click="handleDelete(scope.row.role_id, scope.row)"
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
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="addForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item>
          <el-tree
            :data="menuData"
            show-checkbox
            default-expand-all
            node-key="menu_id"
            ref="tree"
            highlight-current
            :props="defaultProps"
          ></el-tree>
        </el-form-item>
        <el-form-item label="描述" prop="describe">
          <el-input type="textarea" :rows="2" v-model="addForm.describe"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addFormVisible = false">取消</el-button>
        <el-button type="primary" @click="addSubmit" :loading="addLoading">提交</el-button>
      </div>
    </el-dialog>
    <!--编辑界面-->
    <el-dialog title="编辑" :visible.sync="editFormVisible" width="35%">
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="editForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item>
          <el-tree
            :data="menuData"
            show-checkbox
            default-expand-all
            node-key="menu_id"
            ref="tree"
            highlight-current
            :props="defaultProps"
            :default-checked-keys="defailtKeys"
          ></el-tree>
        </el-form-item>
        <el-form-item label="描述" prop="describe">
          <el-input type="textarea" :rows="2" v-model="editForm.describe"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="editFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "RoleManage",

  data() {
    return {
      tableData: [],
      multipleSelection: [],
      currentPage: 1, //初始页
      pagesize: 10, //    每页的数据

      platformOptions: [], // 平台列表

      //编辑界面是否显示
      editFormVisible: false,
      editLoading: false,

      //编辑界面数据
      editForm: {
        roleId: "",
        name: "",
        describe: ""
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
            message: "请输入角色名称",
            trigger: "blur"
          }
        ]
      },
      //新增界面数据
      addForm: {
        name: "",
        describe: "",
        platformId: ""
      },
      // 权限节点数据
      menuData: [],
      defaultProps: {
        children: "child",
        label: "title"
      },
      defailtKeys: "",
      admin_id: sessionStorage.getItem("admin_id"),
      token: sessionStorage.getItem(
        sessionStorage.getItem("admin_id") + "token"
      ),
    };
  },
  methods: {
    loadData() {
      var roleUrl = this.Api + "Role/role"; // 获取角色列表
      this.axios
        .post(roleUrl, this.$qs.stringify())
        .then(response => {
          var code = response.data.code;
          switch (code) {
            case 200:
              this.tableData = response.data.roleInfo;
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
          //console.log(response.data)
        })
        .catch(error => {
          console.log(error);
        });
    },
    getMenuInfo() {
      // // 获取权限节点
      var url = this.Api + "Menu/menu";
      this.axios
        .get(url)
        .then(response => {
          this.menuData = response.data;
          var code = response.data.code;
          switch (code) {
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
          // console.log(this.menuData)
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
    getDefailtKeys(index) {
      // 获取已有权限在编辑也默认
      this.defailtKeys = "";
      var param = {
        roleId: index,
        admin_id: this.admin_id,
        token: this.token
      };
      var url = this.Api + "Role/getRoleMenu";
      this.$axios
        .post(url, this.$qs.stringify(param))
        .then(response => {
          this.defailtKeys = response.data;
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
    handleEdit(index, row) {
      this.getDefailtKeys(index);
      var obj = Object.assign({}, row);
      this.editFormVisible = true;
      this.getMenuInfo();
      this.editForm = obj;
      this.editForm.roleId = index;
    },
    handleDelete(index, row) {
      this.$confirm("确定删除吗？", "提示", {}).then(() => {
        var param = {
          role_id: index,
          admin_id: this.admin_id,
          token: this.token
        };
        var url = this.Api + "Role/roleDelete";
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
      this.getMenuInfo();
      //console.log('add');
    },
    editSubmit() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          //判断是否填写完整  --true
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.editLoading = true;
            var params = {
              roleID: this.editForm.roleId,
              admin_id: this.admin_id,
              token: this.token,
              roleName: this.editForm.name,
              describe: this.editForm.describe,
              menu_id: this.$refs.tree.getCheckedKeys()
            };

            // 发保存请求
            var url = this.Api + "Role/roleMenuEdit";
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
              roleName: this.addForm.name,
              describe: this.addForm.describe,
              platform_ids: this.addForm.platformId,
              menu_id: this.$refs.tree.getCheckedKeys()
            };

            // 发保存请求
            var url = this.Api + "Role/roleMenuAdd";
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
    handleSizeChange(val) {
      this.pagesize = val;
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      console.log(`当前页: ${val}`);
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
