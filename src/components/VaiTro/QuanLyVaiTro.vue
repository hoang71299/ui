<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Quản Lý Vai Trò</h5>
            <button class="btn btn-primary" @click="showAddModal">
              <i class="bx bx-plus me-1"></i> Thêm Vai Trò
            </button>
          </div>
          <div class="card-body">
            <!-- Bộ lọc -->
            <div class="row mb-3">
              <div class="col-md-4">
                <label class="form-label">Trạng Thái</label>
                <select class="form-select" v-model="filters.trangThai">
                  <option value="">Tất cả</option>
                  <option value="true">Hoạt động</option>
                  <option value="false">Không hoạt động</option>
                </select>
              </div>
              <div class="col-md-8">
                <label class="form-label">Tìm Kiếm</label>
                <input type="text" class="form-control" v-model="filters.search" placeholder="Tên vai trò...">
              </div>
            </div>

            <!-- Bảng danh sách vai trò -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Mã Vai Trò</th>
                    <th>Tên Vai Trò</th>
                    <th>Mô Tả</th>
                    <th>Trạng Thái</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="vaiTro in filteredVaiTros" :key="vaiTro.id_vai_tro">
                    <td>{{ vaiTro.id_vai_tro }}</td>
                    <td>{{ vaiTro.ten_vai_tro }}</td>
                    <td>{{ vaiTro.mo_ta }}</td>
                    <td>
                      <span :class="vaiTro.trang_thai ? 'badge bg-success' : 'badge bg-danger'">
                        {{ vaiTro.trang_thai ? 'Hoạt động' : 'Không hoạt động' }}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-warning" @click="editVaiTro(vaiTro)">
                          <i class="bx bx-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" @click="deleteVaiTro(vaiTro)">
                          <i class="bx bx-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-info" @click="managePermissions(vaiTro)">
                          <i class="bx bx-lock-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredVaiTros.length === 0">
                    <td colspan="5" class="text-center">Không có dữ liệu</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Phân trang -->
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                Hiển thị {{ filteredVaiTros.length }} / {{ vaiTros.length }} vai trò
              </div>
              <nav>
                <ul class="pagination mb-0">
                  <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="currentPage--">Trước</a>
                  </li>
                  <li v-for="page in totalPages" :key="page" class="page-item"
                    :class="{ active: page === currentPage }">
                    <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
                  </li>
                  <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <a class="page-link" href="#" @click.prevent="currentPage++">Sau</a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Thêm/Sửa Vai Trò -->
    <div class="modal fade" id="vaiTroModal" tabindex="-1" aria-hidden="true" ref="vaiTroModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Cập Nhật Vai Trò' : 'Thêm Vai Trò Mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveVaiTro">
              <div class="mb-3">
                <label class="form-label">Tên Vai Trò</label>
                <input type="text" class="form-control" v-model="formData.ten_vai_tro" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Mô Tả</label>
                <textarea class="form-control" v-model="formData.mo_ta" rows="3"></textarea>
              </div>
              <div class="form-check form-switch mb-3">
                <input class="form-check-input" type="checkbox" id="trangThai" v-model="formData.trang_thai">
                <label class="form-check-label" for="trangThai">
                  {{ formData.trang_thai ? 'Hoạt động' : 'Không hoạt động' }}
                </label>
              </div>
              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Xác Nhận Xóa -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true" ref="deleteModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác Nhận Xóa</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedVaiTro">
            <p>Bạn có chắc chắn muốn xóa vai trò <strong>{{ selectedVaiTro.ten_vai_tro }}</strong>?</p>
            <p class="text-danger">Hành động này không thể hoàn tác!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">Xóa</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Quản Lý Quyền -->
    <div class="modal fade" id="permissionsModal" tabindex="-1" aria-hidden="true" ref="permissionsModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" v-if="selectedVaiTro">Quản Lý Quyền - {{ selectedVaiTro.ten_vai_tro }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="selectAll" v-model="selectAllPermissions"
                  @change="toggleAllPermissions">
                <label class="form-check-label" for="selectAll">
                  <strong>Chọn tất cả quyền</strong>
                </label>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3" v-for="(permissionGroup, module) in groupedPermissions" :key="module">
                <div class="card">
                  <div class="card-header">
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" :id="'module-' + module"
                        :checked="isModuleSelected(permissionGroup)"
                        @change="toggleModulePermissions(module, permissionGroup)">
                      <label class="form-check-label" :for="'module-' + module">
                        <strong>{{ module }}</strong>
                      </label>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="form-check form-switch mb-2" v-for="permission in permissionGroup"
                      :key="permission.id_quyen">
                      <input class="form-check-input" type="checkbox" :id="'permission-' + permission.id_quyen"
                        v-model="selectedPermissions" :value="permission.id_quyen">
                      <label class="form-check-label" :for="'permission-' + permission.id_quyen">
                        {{ permission.ten_quyen }}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-primary" @click="savePermissions">Lưu Quyền</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Modal } from 'bootstrap';

export default {
  name: 'QuanLyVaiTro',
  data() {
    return {
      vaiTros: [],
      permissions: [],
      selectedVaiTro: null,
      selectedPermissions: [],
      selectAllPermissions: false,
      isEditing: false,
      formData: {
        ten_vai_tro: '',
        mo_ta: '',
        trang_thai: true
      },
      filters: {
        trangThai: '',
        search: ''
      },
      currentPage: 1,
      itemsPerPage: 10,
      vaiTroModal: null,
      deleteModal: null,
      permissionsModal: null
    };
  },
  computed: {
    filteredVaiTros() {
      let filtered = [...this.vaiTros];

      if (this.filters.trangThai !== '') {
        const status = this.filters.trangThai === 'true';
        filtered = filtered.filter(vt => vt.trang_thai === status);
      }

      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        filtered = filtered.filter(vt =>
          vt.ten_vai_tro.toLowerCase().includes(searchTerm) ||
          (vt.mo_ta && vt.mo_ta.toLowerCase().includes(searchTerm))
        );
      }

      // Phân trang
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filtered.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.vaiTros.length / this.itemsPerPage);
    },
    groupedPermissions() {
      const grouped = {};

      this.permissions.forEach(permission => {
        const module = permission.module || 'Khác';

        if (!grouped[module]) {
          grouped[module] = [];
        }

        grouped[module].push(permission);
      });

      return grouped;
    }
  },
  mounted() {
    this.fetchData();
    this.initModals();
  },
  methods: {
    initModals() {
      this.vaiTroModal = new Modal(this.$refs.vaiTroModal);
      this.deleteModal = new Modal(this.$refs.deleteModal);
      this.permissionsModal = new Modal(this.$refs.permissionsModal);
    },
    async fetchData() {
      try {
        // Fetch vai trò
        const vaiTroResponse = await axios.get('http://127.0.0.1:8000/api/vai-tro');
        this.vaiTros = vaiTroResponse.data;

        // Fetch quyền
        const permissionsResponse = await axios.get('http://127.0.0.1:8000/api/quyen');
        this.permissions = permissionsResponse.data;
      } catch (error) {
        console.error('Error fetching data:', error);

        // Dữ liệu mẫu nếu API không hoạt động
        this.vaiTros = [
          {
            id_vai_tro: 1,
            ten_vai_tro: 'Admin',
            mo_ta: 'Quản trị viên hệ thống',
            trang_thai: true
          },
          {
            id_vai_tro: 2,
            ten_vai_tro: 'Nhân viên',
            mo_ta: 'Nhân viên công ty',
            trang_thai: true
          }
        ];

        this.permissions = [
          { id_quyen: 1, ten_quyen: 'Xem người dùng', module: 'Người dùng' },
          { id_quyen: 2, ten_quyen: 'Thêm người dùng', module: 'Người dùng' },
          { id_quyen: 3, ten_quyen: 'Sửa người dùng', module: 'Người dùng' },
          { id_quyen: 4, ten_quyen: 'Xóa người dùng', module: 'Người dùng' },
          { id_quyen: 5, ten_quyen: 'Xem phòng ban', module: 'Phòng ban' },
          { id_quyen: 6, ten_quyen: 'Thêm phòng ban', module: 'Phòng ban' },
          { id_quyen: 7, ten_quyen: 'Sửa phòng ban', module: 'Phòng ban' },
          { id_quyen: 8, ten_quyen: 'Xóa phòng ban', module: 'Phòng ban' }
        ];
      }
    },
    resetForm() {
      this.formData = {
        ten_vai_tro: '',
        mo_ta: '',
        trang_thai: true
      };
    },
    showAddModal() {
      this.isEditing = false;
      this.resetForm();
      this.vaiTroModal.show();
    },
    editVaiTro(vaiTro) {
      this.isEditing = true;
      this.selectedVaiTro = vaiTro;
      this.formData = { ...vaiTro };
      this.vaiTroModal.show();
    },
    deleteVaiTro(vaiTro) {
      this.selectedVaiTro = vaiTro;
      this.deleteModal.show();
    },
    async managePermissions(vaiTro) {
      this.selectedVaiTro = vaiTro;

      try {
        // Lấy danh sách quyền của vai trò
        const response = await axios.get(`http://127.0.0.1:8000/api/vai-tro/${vaiTro.id_vai_tro}/quyen`);
        this.selectedPermissions = response.data.map(p => p.id_quyen);
      } catch (error) {
        console.error('Error fetching role permissions:', error);
        // Dữ liệu mẫu nếu API không hoạt động
        if (vaiTro.id_vai_tro === 1) {
          // Admin có tất cả quyền
          this.selectedPermissions = this.permissions.map(p => p.id_quyen);
        } else {
          // Nhân viên chỉ có quyền xem
          this.selectedPermissions = [1, 5];
        }
      }

      // Kiểm tra nếu tất cả quyền được chọn
      this.selectAllPermissions = this.selectedPermissions.length === this.permissions.length;

      this.permissionsModal.show();
    },
    isModuleSelected(permissionGroup) {
      return permissionGroup.every(permission =>
        this.selectedPermissions.includes(permission.id_quyen)
      );
    },
    toggleModulePermissions(module, permissionGroup) {
      const isSelected = this.isModuleSelected(permissionGroup);

      if (isSelected) {
        // Nếu tất cả quyền trong module đã được chọn, bỏ chọn tất cả
        permissionGroup.forEach(permission => {
          const index = this.selectedPermissions.indexOf(permission.id_quyen);
          if (index !== -1) {
            this.selectedPermissions.splice(index, 1);
          }
        });
      } else {
        // Nếu không, chọn tất cả quyền trong module
        permissionGroup.forEach(permission => {
          if (!this.selectedPermissions.includes(permission.id_quyen)) {
            this.selectedPermissions.push(permission.id_quyen);
          }
        });
      }

      // Cập nhật trạng thái chọn tất cả
      this.selectAllPermissions = this.selectedPermissions.length === this.permissions.length;
    },
    toggleAllPermissions() {
      if (this.selectAllPermissions) {
        // Chọn tất cả quyền
        this.selectedPermissions = this.permissions.map(p => p.id_quyen);
      } else {
        // Bỏ chọn tất cả quyền
        this.selectedPermissions = [];
      }
    },
    async saveVaiTro() {
      try {
        if (this.isEditing) {
          // Cập nhật vai trò
          await axios.put(`http://127.0.0.1:8000/api/vai-tro/${this.selectedVaiTro.id_vai_tro}`, this.formData);

          // Cập nhật dữ liệu trong mảng
          const index = this.vaiTros.findIndex(vt => vt.id_vai_tro === this.selectedVaiTro.id_vai_tro);
          if (index !== -1) {
            this.vaiTros[index] = { ...this.formData, id_vai_tro: this.selectedVaiTro.id_vai_tro };
          }
        } else {
          // Thêm vai trò mới
          const response = await axios.post('http://127.0.0.1:8000/api/vai-tro', this.formData);
          this.vaiTros.push(response.data);
        }

        this.vaiTroModal.hide();
        this.resetForm();
      } catch (error) {
        console.error('Error saving role:', error);
        alert('Có lỗi xảy ra khi lưu thông tin vai trò!');
      }
    },
    async confirmDelete() {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/vai-tro/${this.selectedVaiTro.id_vai_tro}`);

        // Xóa vai trò khỏi mảng
        this.vaiTros = this.vaiTros.filter(vt => vt.id_vai_tro !== this.selectedVaiTro.id_vai_tro);

        this.deleteModal.hide();
      } catch (error) {
        console.error('Error deleting role:', error);
        alert('Có lỗi xảy ra khi xóa vai trò!');
      }
    },
    async savePermissions() {
      try {
        await axios.post(`http://127.0.0.1:8000/api/vai-tro/${this.selectedVaiTro.id_vai_tro}/quyen`, {
          quyen: this.selectedPermissions
        });

        this.permissionsModal.hide();
        alert('Cập nhật quyền thành công!');
      } catch (error) {
        console.error('Error saving permissions:', error);
        alert('Có lỗi xảy ra khi lưu quyền!');
      }
    }
  }
};
</script>

<style scoped>
.card {
  margin-bottom: 20px;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.table th {
  font-weight: 500;
  background-color: #f8f9fa;
}

.badge {
  font-weight: 500;
}
</style>