<template>
  <div class="SystemLog">
    <template>
      <el-button id="add" type="danger" @click="handleDelete()">批量删除</el-button>
      <el-table
        :data="tableData.slice((currentPage-1)*pagesize,currentPage*pagesize)"
        height="750"
        stripe
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"></el-table-column>

        <el-table-column prop="id" label="ID" width="55" sortable></el-table-column>

        <el-table-column prop="admin_name" label="管理员" width="180"></el-table-column>

        <el-table-column prop="title" label="标题"></el-table-column>

        <el-table-column prop="url" label="URL"></el-table-column>

        <el-table-column prop="ip" label="IP"></el-table-column>

        <el-table-column prop="create_time" label="创建时间"></el-table-column>

        <el-table-column label="操作">
          <template slot-scope="scope">
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
  </div>
</template>

<script>
export default {
  name: "SystemLog",
  data() {
    return {
      tableData: [],
      multipleSelection: [],
      currentPage: 1, //初始页
      pagesize: 10, //    每页的数据
      admin_id: sessionStorage.getItem("admin_id"),
      token: sessionStorage.getItem(
        sessionStorage.getItem("admin_id") + "token"
      ),
    };
  },
  methods: {
    loadData() {
     
      var url = this.Api + "Log/log"; // 系统日志
      this.axios
        .post(url, this.$qs.stringify())
        .then(response => {
          this.tableData = response.data;

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
      this.multipleSelection = [];
      for (var item in val) {
        this.multipleSelection.push(val[item].id);
      }

      console.log(this.multipleSelection);
    },
    handleEdit(index, row) {
      console.log(index, row);
    },
    handleDelete(index, row) {
      this.$confirm("确定批量删除吗？", "提示", {}).then(() => {
        var param = {
          id: !index ? this.multipleSelection : index,
          admin_id: this.admin_id,
          token: this.token
        };

        var url = this.Api + "Log/deleteLog"; // 删除日志
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
