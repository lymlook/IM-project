<template>
  <div class="SystemSet">
    <el-tabs type="border-card">
      <template>
        <div style="width: 100%;margin-bottom: 20px;">
          <el-button id="add" type="primary" @click="dictionaryAdd()">增加</el-button>
          <el-table
            :data="tableData"
            row-key="id"
            stripe
            height="700"
            border
            default-expand-all
            :tree-props="{children: 'child', hasChildren: 'hasChild'}"
          >
            <el-table-column prop="id" label="ID" sortable width="100"></el-table-column>

            <el-table-column prop="name" label="名称：name" width="120"></el-table-column>

            <el-table-column prop="values" label="值：values" width="130"></el-table-column>

            <el-table-column prop="status" label="状态值：status" width="130"></el-table-column>

            <el-table-column prop="describe" label="描述"></el-table-column>

            <el-table-column prop="create_time" label="创建时间" sortable width="180"></el-table-column>

            <el-table-column prop="update_time" label="修改时间" sortable width="180"></el-table-column>

            <el-table-column label="操作" width="200">
              <template slot-scope="scope">
                <el-button size="mini" @click="dictionaryEdit(scope.row.id, scope.row)">编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  @click="dictionaryDelete(scope.row.id, scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>
      <!-- </el-tab-pane> -->
    </el-tabs>
    <!-- 字典新增界面 -->
    <el-dialog title="新增" :visible.sync="addFormVisible" width="35%">
      <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
        <el-form-item label="名称" prop="name">
          <el-input v-model="addForm.name" auto-complete="off" placeholder="请输入名称"></el-input>
        </el-form-item>

        <el-form-item label="值" prop="values">
          <el-input v-model="addForm.values" auto-complete="off" placeholder="请输入值"></el-input>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <template>
            <el-radio v-model="addForm.status" :label="1">是( 值：1 )</el-radio>
            <el-radio v-model="addForm.status" :label="0">否( 值：0 )</el-radio>
          </template>
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
          <el-input v-model="editForm.name" :disabled="true" auto-complete="off"></el-input>
        </el-form-item>

        <el-form-item label="值" prop="values">
          <el-input v-model="editForm.values" auto-complete="off"></el-input>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <template>
            <el-radio v-model="editForm.status" :label="1">是( 值：1 )</el-radio>
            <el-radio v-model="editForm.status" :label="0">否( 值：0 )</el-radio>
          </template>
        </el-form-item>

        <el-form-item label="描述" prop="describe">
          <el-input type="textarea" v-model="editForm.describe" auto-complete="off"></el-input>
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
  name: "SystemSet",
  data() {
    return {
      tableData: [],
      options: [],
      //编辑界面是否显示
      editFormVisible: false,
      editLoading: false,
      editFormRules: {
        name: [
          {
            required: true,
            message: "请输入名称",
            trigger: "blur"
          }
        ],
        values: [
          {
            required: true,
            message: "请输入值",
            trigger: "blur"
          }
        ]
      },
      //编辑界面数据
      editForm: {
        name: "",
        values: "",
        status: "",
        describe: "",
        id: ""
      },
      //字典新增界面是否显示
      addFormVisible: false,
      addLoading: false,
      addFormRules: {
        name: [
          {
            required: true,
            message: "请输入名称",
            trigger: "blur"
          }
        ],
        values: [
          {
            required: true,
            message: "请输入值",
            trigger: "blur"
          }
        ]
      },
      //新增界面数据
      addForm: {
        name: "",
        values: "",
        sort: "",
        describe: ""
      },
      admin_id: sessionStorage.getItem("admin_id"),
      token: sessionStorage.getItem(
        sessionStorage.getItem("admin_id") + "token"
      )
    };
  },
  methods: {
    loadData() {
      var url = this.Api + "Dictionary/getDictionary"; // 字典
      this.axios
        .get(url)
        .then(response => {
          console.log(response.data);
          switch (response.data.code) {
            case 200:
              this.tableData = response.data.dictionary;

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
        .catch(error => {
          console.log(error);
        });
    },

    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    dictionaryAdd() {
      this.addFormVisible = true;
      console.log("add");
    },
    addSubmit() {
      var that = this;

      this.$refs.addForm.validate(valid => {
        if (this.valueId == null) {
          this.valueId = 0;
        }
        if (valid) {
          //判断是否填写完整  --true
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.addLoading = true;
            var params = {
              admin_id: this.admin_id,
              token: this.token,
              name: this.addForm.name,
              values: this.addForm.values,
              status: this.addForm.status,
              describe: this.addForm.describe
            };
            console.log(params);

            // 发保存请求
            var url = this.Api + "Dictionary/DictionaryAdd"; // 添加字典
            this.$axios
              .post(url, that.$qs.stringify(params))
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
    dictionaryEdit(index, row) {
      console.log(Object.assign({}, row));
      var obj = Object.assign({}, row);
      this.editFormVisible = true;
      this.editForm = obj;
      this.editForm.id = index;
      console.log(index, row);
    },
    editSubmit() {
      var that = this;
      this.$refs.editForm.validate(valid => {
        if (valid) {
          //判断是否填写完整  --true
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.editLoading = true;
            var params = {
              admin_id: this.admin_id,
              token: this.token,
              name: this.editForm.name,
              values: this.editForm.values,
              status: this.editForm.status,
              describe: this.editForm.describe,
              id: this.editForm.id
            };

            // 发保存请求
            var url = this.Api + "Dictionary/DictionaryEdit";
            this.$axios
              .post(url, that.$qs.stringify(params))
              .then(response => {
                this.editLoading = false;

                switch (response.data.code) {
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
    dictionaryDelete(index, row) {
      this.$confirm("确定删除吗？", "提示", {}).then(() => {
        var param = {
          id: index,
          admin_id: this.admin_id,
          token: this.token
        };
        var url = this.Api + "Dictionary/DictionaryDelete"; // 删除字典
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
.dictionary {
  width: 50%;
  float: right;
  margin-top: 10px;
}
#add {
  float: left;
}
</style>
