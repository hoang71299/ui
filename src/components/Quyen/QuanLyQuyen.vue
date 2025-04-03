<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Quản Lý Quyền</h5>
            <button class="btn btn-primary" @click="showAddModal">
              <i class="bx bx-plus me-1"></i> Thêm Quyền
            </button>
          </div>
          <div class="card-body">
            <!-- Bộ lọc -->
            <div class="row mb-3">
              <div class="col-md-4">
                <label class="form-label">Module</label>
                <select class="form-select" v-model="filters.module">
                  <option value="">Tất cả</option>
                  <option v-for="module in modules" :key="module" :value="module">
                    {{ module }}
                  </option>
                </select>
              </div>
              <div class="col-md-8">
                <label class="form-label">Tìm Kiếm</label>
                <input type="text" class="form-control" v-model="filters.search" placeholder="Tên quyền...">
              </div>
            </div>

            <!-- Bảng danh sách quyền -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Mã Quyền</th>
                    <th>Tên Quyền</th>
                    <th>Module</th>
                    <th>Mô Tả</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="quyen in filteredQuyens" :key="quyen.id_quyen">
                    <td>{{ quyen.id_quyen }}</td>
                    <td>{{ quyen.ten_quyen }}</td>
                    <td>{{ quyen.module }}</td>
                    <td>{{ quyen.mo_ta }}</td>
                    <td>
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-warning" @click="editQuyen(quyen)">
                          <i class="bx bx-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" @click="deleteQuyen(quyen)">
                          <i class="bx bx-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredQuyens.length === 0">
                    <td colspan="5" class="text-center">Không có dữ liệu</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Phân trang -->
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                Hiển thị {{ filteredQuyens.length }} / {{ quyens.length }} quyền
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

    <!-- Modal Thêm/Sửa Quyền -->
    <div class="modal fade" id="quyenModal" tabindex="-1" aria-hidden="true" ref="quyenModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Cập Nhật Quyền' : 'Thêm Quyền Mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveQuyen">
              <div class="mb-3">
                <label class="form-label">Tên Quyền</label>
                <input type="text" class="form-control" v-model="formData.ten_quyen" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Module</label>
                <select class="form-select" v-model="formData.module" required>
                  <option value="">Chọn module</option>
                  <option v-for="module in modules" :key="module" :value="module">
                    {{ module }}
                  </option>
                  <option value="new">+ Thêm module mới</option>
                </select>
              </div>
              <div class="mb-3" v-if="formData.module === 'new'">
                <label class="form-label">Tên Module Mới</label>
                <input type="text" class="form-control" v-model="newModule" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Mô Tả</label>
                <textarea class="form-control" v-model="formData.mo_ta" rows="3"></textarea>
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
          <div class="modal-body" v-if="selectedQuyen">
            <p>Bạn có chắc chắn muốn xóa quyền <strong>{{ selectedQuyen.ten_quyen }}</strong>?</p>
            <p class="text-danger">Hành động này không thể hoàn tác!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">Xóa</button>
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
  name: 'QuanLyQuyen',
  data() {
    return {
      quyens: [],
      selectedQuyen: null,
      isEditing: false,
      formData: {
        ten_quyen: '',
        module: '',
        mo_ta: ''
      },
      newModule: '',
      filters: {
        module: '',
        search: ''
      },
      currentPage: 1,
      itemsPerPage: 10,
      quyenModal: null,
      deleteModal: null
    };
  },
  computed: {
    modules() {
      // Lấy danh sách các module duy nhất
      const moduleSet = new Set();
      this.quyens.forEach(quyen => {
        if (quyen.module) {
          moduleSet.add(quyen.module);
        }
      });
      return Array.from(moduleSet).sort();
    },
    filteredQuyens() {
      let filtered = [...this.quyens];

      if (this.filters.module) {
        filtered = filtered.filter(q => q.module === this.filters.module);
      }

      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        filtered = filtered.filter(q =>
          q.ten_quyen.toLowerCase().includes(searchTerm) ||
          (q.mo_ta && q.mo_ta.toLowerCase().includes(searchTerm))
        );
      }

      // Phân trang
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filtered.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.quyens.length / this.itemsPerPage);
    }
  },
  mounted() {
    this.fetchData();
    this.initModals();
  },
  methods: {
    initModals() {
      this.quyenModal = new Modal(this.$refs.quyenModal);
      this.deleteModal = new Modal(this.$refs.deleteModal);
    },
    async fetchData() {
      try {
        // Fetch quyền
        const quyenResponse = await axios.get('http://127.0.0.1:8000/api/quyen');
        this.quyens = quyenResponse.data;
      } catch (error) {
        console.error('Error fetching data:', error);

        // Dữ liệu mẫu nếu API không hoạt động
        this.quyens = [
          { id_quyen: 1, ten_quyen: 'Xem người dùng', module: 'Người dùng', mo_ta: 'Quyền xem danh sách người dùng' },
          { id_quyen: 2, ten_quyen: 'Thêm người dùng', module: 'Người dùng', mo_ta: 'Quyền thêm người dùng mới' },
          { id_quyen: 3, ten_quyen: 'Sửa người dùng', module: 'Người dùng', mo_ta: 'Quyền sửa thông tin người dùng' },
          { id_quyen: 4, ten_quyen: 'Xóa người dùng', module: 'Người dùng', mo_ta: 'Quyền xóa người dùng' },
          { id_quyen: 5, ten_quyen: 'Xem phòng ban', module: 'Phòng ban', mo_ta: 'Quyền xem danh sách phòng ban' },
          { id_quyen: 6, ten_quyen: 'Thêm phòng ban', module: 'Phòng ban', mo_ta: 'Quyền thêm phòng ban mới' },
          { id_quyen: 7, ten_quyen: 'Sửa phòng ban', module: 'Phòng ban', mo_ta: 'Quyền sửa thông tin phòng ban' },
          { id_quyen: 8, ten_quyen: 'Xóa phòng ban', module: 'Phòng ban', mo_ta: 'Quyền xóa phòng ban' }
        ];
      }
    },
    resetForm() {
      this.formData = {
        ten_quyen: '',
        module: '',
        mo_ta: ''
      };
      this.newModule = '';
    },
    showAddModal() {
      this.isEditing = false;
      this.resetForm();
      this.quyenModal.show();
    },
    editQuyen(quyen) {
      this.isEditing = true;
      this.selectedQuyen = quyen;
      this.formData = { ...quyen };
      this.quyenModal.show();
    },
    deleteQuyen(quyen) {
      this.selectedQuyen = quyen;
      this.deleteModal.show();
    },
    async saveQuyen() {
      try {
        // Xử lý trường hợp thêm module mới
        if (this.formData.module === 'new' && this.newModule) {
          this.formData.module = this.newModule;
        }

        if (this.isEditing) {
          // Cập nhật quyền
          await axios.put(`http://127.0.0.1:8000/api/quyen/${this.selectedQuyen.id_quyen}`, this.formData);

          // Cập nhật dữ liệu trong mảng
          const index = this.quyens.findIndex(q => q.id_quyen === this.selectedQuyen.id_quyen);
          if (index !== -1) {
            this.quyens[index] = { ...this.quyens[index], ...this.formData };
          }
        } else {
          // Thêm quyền mới
          const response = await axios.post('http://127.0.0.1:8000/api/quyen', this.formData);
          this.quyens.push(response.data);
        }

        this.quyenModal.hide();
        this.resetForm();
      } catch (error) {
        console.error('Error saving permission:', error);
        alert('Có lỗi xảy ra khi lưu thông tin quyền!');
      }
    },
    async confirmDelete() {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/quyen/${this.selectedQuyen.id_quyen}`);

        // Xóa quyền khỏi mảng
        this.quyens = this.quyens.filter(q => q.id_quyen !== this.selectedQuyen.id_quyen);

        this.deleteModal.hide();
      } catch (error) {
        console.error('Error deleting permission:', error);
        alert('Có lỗi xảy ra khi xóa quyền!');
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
</style>