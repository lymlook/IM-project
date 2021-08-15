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

        <el-table-column prop="id" label="ID" width="55"></el-table-column>

        <el-table-column prop="tabbar_name" label="tabbar名称" width="180"></el-table-column>

        <el-table-column prop="url" label="路径"></el-table-column>

        <el-table-column prop="icon" label="图标"></el-table-column>

        <el-table-column label="显示" width="155">
          <template slot-scope="scope">
            <el-popover trigger="hover" placement="left">
              <p>点击切换状态</p>
              <div slot="reference" class="name-wrapper">
                <el-button
                  size="mini"
                  v-if="scope.row.state == '显示'"
                  type="primary"
                  @click="editState(scope.row.id,state=0)"
                >{{scope.row.state}}</el-button>
                <el-button
                  size="mini"
                  v-if="scope.row.state == '隐藏'"
                  type="danger"
                  @click="editState(scope.row.id,state=1)"
                >{{scope.row.state}}</el-button>
              </div>
            </el-popover>
          </template>
        </el-table-column>

        <el-table-column prop="update_time" label="修改时间" width="200"></el-table-column>

        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEdit(scope.row.id, scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(scope.row.id, scope.row)">删除</el-button>
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
        <el-form-item label="名称" prop="tabbar_name">
          <el-input v-model="addForm.tabbar_name" placeholder="请输入tabbar名称" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="路径" prop="url">
          <el-input v-model="addForm.url" placeholder="请输入tabbar路径" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="addForm.icon" placeholder="请输入图标路径" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="是否显示">
          <template>
            <el-radio v-model="addForm.radio" label="1">显示</el-radio>
            <el-radio v-model="addForm.radio" label="0">隐藏</el-radio>
          </template>
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
        <el-form-item label="名称" prop="tabbar_name">
          <el-input v-model="editForm.tabbar_name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="路径" prop="url">
          <el-input v-model="editForm.url" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="editForm.icon" auto-complete="off"></el-input>
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
  name: "AdminManage",
  data() {
    return {
      tableData: [],
      multipleSelection: [],
      currentPage: 1, //初始页
      pagesize: 10, //    每页的数据

      roleOptions: [],

      //编辑界面是否显示
      editFormVisible: false,
      editLoading: false,

      //编辑界面数据
      editForm: {
        tabbar_name: "",
        url: "",
        icon: "",
        id: ""
      },
      editFormRules: {
        tabbar_name: [
          {
            required: true,
            message: "请输入tabbar名称",
            trigger: "blur"
          }
        ],
        url: [
          {
            required: true,
            message: "请输入路径",
            trigger: "blur"
          }
        ],
        icon: [
          {
            required: true,
            message: "请输入图标路径",
            trigger: "blur"
          }
        ]
      },
      //新增界面是否显示
      addFormVisible: false,
      addLoading: false,
      addFormRules: {
        tabbar_name: [
          {
            required: true,
            message: "请输入tabbar名称",
            trigger: "blur"
          }
        ],
        url: [
          {
            required: true,
            message: "请输入路径",
            trigger: "blur"
          }
        ],
        icon: [
          {
            required: true,
            message: "请输入图标路径",
            trigger: "blur"
          }
        ]
      },
      //新增界面数据
      addForm: {
        tabbar_name: "",
        url: "",
        icon: "",
        radio: "1"
      },
      admin_id: sessionStorage.getItem("admin_id"),
      token: sessionStorage.getItem(
        sessionStorage.getItem("admin_id") + "token"
      )
    };
  },
  methods: {
    loadData() {
      var adminUrl = this.Api + "ClientManage/getTabbarList"; // 获取管理员列表

      this.$axios
        .get(adminUrl)
        .then(response => {
          this.tableData = response.data.data;
          if (response.data.code == 40001) {
            this.$message({
              showClose: true,
              type: "warning",
              message: response.data.msg
            });
          }
          console.log(this.tableData);
        })
        .catch(error => {
          console.log(error);
        });
    },
    getRoleInfo() {
      var roleUrl = this.Api + "Role/role";

      this.$axios
        .get(roleUrl)
        .then(response => {
          this.roleOptions = response.data;
          if (response.data.code == 40001) {
            this.$message({
              showClose: true,
              type: "warning",
              message: response.data.msg
            });
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
    handleEdit(index, row) {
      var obj = Object.assign({}, row);
      this.editFormVisible = true;
      this.editForm = obj;
      this.editForm.id = index;
      this.getRoleInfo();
      console.log(this.editForm);
      //console.log(index, row);
    },
    handleDelete(index, row) {
      this.$confirm("确认删除吗？", "提示", {}).then(() => {
        var param = {
          admin_id: this.admin_id,
          token: this.token,
          id: index
        };
        var url = this.Api + "ClientManage/deleteTabbar";
        this.$axios
          .post(url, this.$qs.stringify(param))
          .then(response => {
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
              case 405:
                this.$message({
                  showClose: true,
                  type: "warning",
                  message: response.data.msg
                });
                setTimeout(() => {
                      this.$router.push({ path: "/login" });
                    }, 1500);
                break;
              default:
                this.$message.error(response.data.msg);
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
    editSubmit() {
      var that = this;
      this.$refs.editForm.validate(valid => {
        if (valid) {
          //判断是否填写完整  --true
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.editLoading = true;
            var params = {
              id: this.editForm.id,
              tabbar_name: this.editForm.tabbar_name,
              url: this.editForm.url,
              icon: this.editForm.icon,
              admin_id: this.admin_id,
              token: this.token
            };
            console.log(params);
            // 发保存请求
            var url = this.Api + "ClientManage/upTabbar";
            this.$axios
              .post(url, that.$qs.stringify(params))
              .then(response => {
                this.editLoading = false;
                console.log(response.data.code);
                var code = response.data.code;
                switch (code) {
                  case 200:
                    // 表单重置
                    that.$refs["editForm"].resetFields();
                    that.editFormVisible = false;
                    that.loadData();

                    that.$message({
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
                  case 405:
                    this.$message({
                      showClose: true,
                      type: "warning",
                      message: response.data.msg
                    });
                    break;
                  default:
                    this.$message.error(response.data.msg);
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
      var that = this;
      this.$refs.addForm.validate(valid => {
        if (valid) {
          //判断是否填写完整  --true
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.addLoading = true;
            var params = {
              admin_id: this.admin_id,
              token: this.token,
              tabbar_name: this.addForm.tabbar_name,
              url: this.addForm.url,
              state: this.addForm.radio,
              icon: this.addForm.icon
            };

            // 发保存请求
            var url = this.Api + "ClientManage/addTabbar";
            this.$axios
              .post(url, that.$qs.stringify(params))
              .then(response => {
                this.addLoading = false;

                var code = response.data.code;
                switch (code) {
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
                  case 40001:
                    this.$message({
                      showClose: true,
                      type: "warning",
                      message: response.data.msg
                    });
                    break;
                  case 405:
                    this.$message({
                      showClose: true,
                      type: "warning",
                      message: response.data.msg
                    });
                    break;
                  default:
                    this.$message.error(response.data.msg);
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
    editState(id, state) {
      var params = {
        id: id,
        state: state,
        admin_id: this.admin_id,
        token: this.token
      };
      var url = this.Api + "ClientManage/editState";
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
            case 405:
              this.$message({
                showClose: true,
                type: "warning",
                message: response.data.msg
              });
              break;
            default:
              this.$message.error(response.data.msg);
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
     if(!this.admin_id || !this.token){
      this.$router.push({path: '/Login'})
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
