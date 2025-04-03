<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Quản Lý Phân Quyền</h5>
            <button class="btn btn-primary" @click="showAddModal">
              <i class="bx bx-plus me-1"></i> Thêm Phân Quyền
            </button>
          </div>
          <div class="card-body">
            <!-- Bộ lọc -->
            <div class="row mb-3">
              <div class="col-md-4">
                <label class="form-label">Chức Danh</label>
                <select class="form-select" v-model="filters.chucDanh">
                  <option value="">Tất cả</option>
                  <option v-for="cd in chucDanhs" :key="cd.id_chuc_danh" :value="cd.id_chuc_danh">
                    {{ cd.ten_chuc_danh }}
                  </option>
                </select>
              </div>
              <div class="col-md-8">
                <label class="form-label">Tìm Kiếm</label>
                <div class="input-group">
                  <input type="text" class="form-control" placeholder="Tìm theo tên quyền..." v-model="filters.search">
                  <button class="btn btn-outline-primary" type="button">
                    <i class="bx bx-search"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Bảng dữ liệu -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Chức Danh</th>
                    <th>Quyền</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="phanQuyen in filteredPhanQuyens" :key="phanQuyen.id_phan_quyen">
                    <td>{{ phanQuyen.id_phan_quyen }}</td>
                    <td>{{ getChucDanhName(phanQuyen.id_chuc_danh) }}</td>
                    <td>{{ getQuyenName(phanQuyen.id_quyen) }}</td>
                    <td>
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-warning" @click="editPhanQuyen(phanQuyen)">
                          <i class="bx bx-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" @click="deletePhanQuyen(phanQuyen)">
                          <i class="bx bx-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredPhanQuyens.length === 0">
                    <td colspan="4" class="text-center">Không có dữ liệu</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Phân trang -->
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                Hiển thị {{ filteredPhanQuyens.length }} / {{ phanQuyens.length }} phân quyền
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

    <!-- Modal Thêm/Sửa Phân Quyền -->
    <div class="modal fade" id="phanQuyenModal" tabindex="-1" aria-hidden="true" ref="phanQuyenModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Cập Nhật Phân Quyền' : 'Thêm Phân Quyền Mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="savePhanQuyen">
              <div class="mb-3">
                <label class="form-label">Chức Danh</label>
                <select class="form-select" v-model="formData.id_chuc_danh" required>
                  <option v-for="cd in chucDanhs" :key="cd.id_chuc_danh" :value="cd.id_chuc_danh">
                    {{ cd.ten_chuc_danh }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Quyền</label>
                <select class="form-select" v-model="formData.id_quyen" required>
                  <option v-for="quyen in quyens" :key="quyen.id_quyen" :value="quyen.id_quyen">
                    {{ quyen.ten_quyen }}
                  </option>
                </select>
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
          <div class="modal-body" v-if="selectedPhanQuyen">
            <p>Bạn có chắc chắn muốn xóa phân quyền này?</p>
            <p><strong>Chức danh:</strong> {{ getChucDanhName(selectedPhanQuyen.id_chuc_danh) }}</p>
            <p><strong>Quyền:</strong> {{ getQuyenName(selectedPhanQuyen.id_quyen) }}</p>
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
  name: 'QuanLyPhanQuyen',
  data() {
    return {
      phanQuyens: [],
      chucDanhs: [],
      quyens: [],
      selectedPhanQuyen: null,
      isEditing: false,
      formData: {
        id_chuc_danh: '',
        id_quyen: ''
      },
      filters: {
        chucDanh: '',
        search: ''
      },
      currentPage: 1,
      itemsPerPage: 10,
      phanQuyenModal: null,
      deleteModal: null
    };
  },
  computed: {
    filteredPhanQuyens() {
      let filtered = [...this.phanQuyens];

      if (this.filters.chucDanh !== '') {
        filtered = filtered.filter(pq => pq.id_chuc_danh === parseInt(this.filters.chucDanh));
      }

      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        filtered = filtered.filter(pq => {
          const quyen = this.quyens.find(q => q.id_quyen === pq.id_quyen);
          return quyen && quyen.ten_quyen.toLowerCase().includes(searchTerm);
        });
      }

      // Phân trang
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filtered.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.phanQuyens.length / this.itemsPerPage);
    }
  },
  mounted() {
    this.fetchData();
    this.$nextTick(() => {
      this.initModals();
    });
  },
  methods: {
    initModals() {
      this.phanQuyenModal = new Modal(this.$refs.phanQuyenModal);
      this.deleteModal = new Modal(this.$refs.deleteModal);
    },
    async fetchData() {
      try {
        // Fetch phân quyền
        const phanQuyenResponse = await axios.get('http://127.0.0.1:8000/api/phan-quyen');
        this.phanQuyens = phanQuyenResponse.data;

        // Fetch chức danh
        const chucDanhResponse = await axios.get('http://127.0.0.1:8000/api/chuc-danh');
        this.chucDanhs = chucDanhResponse.data;

        // Fetch quyền
        const quyenResponse = await axios.get('http://127.0.0.1:8000/api/quyen');
        this.quyens = quyenResponse.data;
      } catch (error) {
        console.error('Error fetching data:', error);

        // Dữ liệu mẫu nếu API không hoạt động
        this.chucDanhs = [
          { id_chuc_danh: 1, ten_chuc_danh: 'Giám đốc' },
          { id_chuc_danh: 2, ten_chuc_danh: 'Trưởng phòng' },
          { id_chuc_danh: 3, ten_chuc_danh: 'Nhân viên' }
        ];

        this.quyens = [
          { id_quyen: 1, ten_quyen: 'Quản lý nhân viên', mo_ta: 'Quyền thêm, sửa, xóa nhân viên' },
          { id_quyen: 2, ten_quyen: 'Quản lý phòng ban', mo_ta: 'Quyền thêm, sửa, xóa phòng ban' },
          { id_quyen: 3, ten_quyen: 'Quản lý chức danh', mo_ta: 'Quyền thêm, sửa, xóa chức danh' },
          { id_quyen: 4, ten_quyen: 'Quản lý lương', mo_ta: 'Quyền thêm, sửa, xóa bảng lương' },
          { id_quyen: 5, ten_quyen: 'Quản lý chấm công', mo_ta: 'Quyền thêm, sửa, xóa chấm công' },
          { id_quyen: 6, ten_quyen: 'Quản lý đăng ký vắng', mo_ta: 'Quyền thêm, sửa, xóa đăng ký vắng' },
          { id_quyen: 7, ten_quyen: 'Quản lý KPI', mo_ta: 'Quyền thêm, sửa, xóa KPI' }
        ];

        this.phanQuyens = [
          { id_phan_quyen: 1, id_chuc_danh: 1, id_quyen: 1 },
          { id_phan_quyen: 2, id_chuc_danh: 1, id_quyen: 2 },
          { id_phan_quyen: 3, id_chuc_danh: 1, id_quyen: 3 },
          { id_phan_quyen: 4, id_chuc_danh: 1, id_quyen: 4 },
          { id_phan_quyen: 5, id_chuc_danh: 1, id_quyen: 5 },
          { id_phan_quyen: 6, id_chuc_danh: 1, id_quyen: 6 },
          { id_phan_quyen: 7, id_chuc_danh: 1, id_quyen: 7 },
          { id_phan_quyen: 8, id_chuc_danh: 2, id_quyen: 1 },
          { id_phan_quyen: 9, id_chuc_danh: 2, id_quyen: 5 },
          { id_phan_quyen: 10, id_chuc_danh: 2, id_quyen: 6 },
          { id_phan_quyen: 11, id_chuc_danh: 2, id_quyen: 7 }
        ];
      }
    },
    getChucDanhName(id) {
      const chucDanh = this.chucDanhs.find(cd => cd.id_chuc_danh === id);
      return chucDanh ? chucDanh.ten_chuc_danh : 'Không xác định';
    },
    getQuyenName(id) {
      const quyen = this.quyens.find(q => q.id_quyen === id);
      return quyen ? quyen.ten_quyen : 'Không xác định';
    },
    resetForm() {
      this.formData = {
        id_chuc_danh: this.chucDanhs.length > 0 ? this.chucDanhs[0].id_chuc_danh : '',
        id_quyen: this.quyens.length > 0 ? this.quyens[0].id_quyen : ''
      };
    },
    showAddModal() {
      this.isEditing = false;
      this.resetForm();
      this.phanQuyenModal.show();
    },
    editPhanQuyen(phanQuyen) {
      this.isEditing = true;
      this.selectedPhanQuyen = phanQuyen;
      this.formData = { ...phanQuyen };
      this.phanQuyenModal.show();
    },
    deletePhanQuyen(phanQuyen) {
      this.selectedPhanQuyen = phanQuyen;
      this.deleteModal.show();
    },
    async savePhanQuyen() {
      try {
        // Kiểm tra xem phân quyền đã tồn tại chưa
        const isDuplicate = this.phanQuyens.some(pq =>
          pq.id_chuc_danh === parseInt(this.formData.id_chuc_danh) &&
          pq.id_quyen === parseInt(this.formData.id_quyen) &&
          (!this.isEditing || pq.id_phan_quyen !== this.selectedPhanQuyen.id_phan_quyen)
        );

        if (isDuplicate) {
          alert('Phân quyền này đã tồn tại!');
          return;
        }

        if (this.isEditing) {
          // Cập nhật phân quyền
          await axios.put(`http://127.0.0.1:8000/api/phan-quyen/${this.selectedPhanQuyen.id_phan_quyen}`, this.formData);

          // Cập nhật dữ liệu trong mảng
          const index = this.phanQuyens.findIndex(pq => pq.id_phan_quyen === this.selectedPhanQuyen.id_phan_quyen);
          if (index !== -1) {
            this.phanQuyens[index] = { ...this.phanQuyens[index], ...this.formData };
          }

          alert('Cập nhật phân quyền thành công!');
        } else {
          // Thêm phân quyền mới
          const response = await axios.post('http://127.0.0.1:8000/api/phan-quyen', this.formData);
          this.phanQuyens.push(response.data);

          alert('Thêm phân quyền thành công!');
        }

        this.phanQuyenModal.hide();
        this.resetForm();
      } catch (error) {
        console.error('Error saving permission:', error);
        alert(`Lỗi khi lưu phân quyền: ${error.response?.data?.message || error.message}`);
      }
    },
    async confirmDelete() {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/phan-quyen/${this.selectedPhanQuyen.id_phan_quyen}`);

        // Xóa phân quyền khỏi mảng
        this.phanQuyens = this.phanQuyens.filter(pq => pq.id_phan_quyen !== this.selectedPhanQuyen.id_phan_quyen);

        alert('Xóa phân quyền thành công!');
        this.deleteModal.hide();
      } catch (error) {
        console.error('Error deleting permission:', error);
        alert(`Lỗi khi xóa phân quyền: ${error.response?.data?.message || error.message}`);
      }
    }
  }
};
</script>

<style scoped>
.table th {
  white-space: nowrap;
}
</style>