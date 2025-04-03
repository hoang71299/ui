<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Quản Lý Tiêu Chí KPI</h5>
            <button class="btn btn-primary" @click="showAddModal">
              <i class="bx bx-plus me-1"></i> Thêm Tiêu Chí
            </button>
          </div>
          <div class="card-body">
            <!-- Bộ lọc -->
            <div class="row mb-3">
              <div class="col-md-3">
                <label class="form-label">Phòng Ban</label>
                <select class="form-select" v-model="filters.phongBan">
                  <option value="">Tất cả</option>
                  <option v-for="pb in phongBans" :key="pb.id_phong_ban" :value="pb.id_phong_ban">
                    {{ pb.ten_phong_ban }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Chức Danh</label>
                <select class="form-select" v-model="filters.chucDanh">
                  <option value="">Tất cả</option>
                  <option v-for="cd in chucDanhs" :key="cd.id_chuc_danh" :value="cd.id_chuc_danh">
                    {{ cd.ten_chuc_danh }}
                  </option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Tìm Kiếm</label>
                <div class="input-group">
                  <input type="text" class="form-control" placeholder="Tìm theo tên tiêu chí..."
                    v-model="filters.search">
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
                    <th>Tên Tiêu Chí</th>
                    <th>Mô Tả</th>
                    <th>Trọng Số (%)</th>
                    <th>Phòng Ban</th>
                    <th>Chức Danh</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="tieuChi in filteredTieuChis" :key="tieuChi.id_tieu_chi">
                    <td>{{ tieuChi.id_tieu_chi }}</td>
                    <td>{{ tieuChi.ten_tieu_chi }}</td>
                    <td>{{ tieuChi.mo_ta }}</td>
                    <td>{{ tieuChi.trong_so }}</td>
                    <td>{{ getPhongBanName(tieuChi.id_phong_ban) }}</td>
                    <td>{{ getChucDanhName(tieuChi.id_chuc_danh) }}</td>
                    <td>
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-warning" @click="editTieuChi(tieuChi)">
                          <i class="bx bx-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" @click="deleteTieuChi(tieuChi)">
                          <i class="bx bx-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredTieuChis.length === 0">
                    <td colspan="7" class="text-center">Không có dữ liệu</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Phân trang -->
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                Hiển thị {{ filteredTieuChis.length }} / {{ tieuChis.length }} tiêu chí
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

    <!-- Modal Thêm/Sửa Tiêu Chí -->
    <div class="modal fade" id="tieuChiModal" tabindex="-1" aria-hidden="true" ref="tieuChiModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Cập Nhật Tiêu Chí' : 'Thêm Tiêu Chí Mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveTieuChi">
              <div class="mb-3">
                <label class="form-label">Tên Tiêu Chí</label>
                <input type="text" class="form-control" v-model="formData.ten_tieu_chi" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Mô Tả</label>
                <textarea class="form-control" v-model="formData.mo_ta" rows="3"></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Trọng Số (%)</label>
                <input type="number" class="form-control" v-model="formData.trong_so" min="1" max="100" required>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Phòng Ban</label>
                  <select class="form-select" v-model="formData.id_phong_ban">
                    <option value="">Tất cả phòng ban</option>
                    <option v-for="pb in phongBans" :key="pb.id_phong_ban" :value="pb.id_phong_ban">
                      {{ pb.ten_phong_ban }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Chức Danh</label>
                  <select class="form-select" v-model="formData.id_chuc_danh">
                    <option value="">Tất cả chức danh</option>
                    <option v-for="cd in chucDanhs" :key="cd.id_chuc_danh" :value="cd.id_chuc_danh">
                      {{ cd.ten_chuc_danh }}
                    </option>
                  </select>
                </div>
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
          <div class="modal-body" v-if="selectedTieuChi">
            <p>Bạn có chắc chắn muốn xóa tiêu chí <strong>{{ selectedTieuChi.ten_tieu_chi }}</strong>?</p>
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
  name: 'QuanLyTieuChiKPI',
  data() {
    return {
      tieuChis: [],
      phongBans: [],
      chucDanhs: [],
      selectedTieuChi: null,
      isEditing: false,
      formData: {
        ten_tieu_chi: '',
        mo_ta: '',
        trong_so: 10,
        id_phong_ban: '',
        id_chuc_danh: ''
      },
      filters: {
        phongBan: '',
        chucDanh: '',
        search: ''
      },
      currentPage: 1,
      itemsPerPage: 10,
      tieuChiModal: null,
      deleteModal: null
    };
  },
  computed: {
    filteredTieuChis() {
      let filtered = [...this.tieuChis];

      if (this.filters.phongBan !== '') {
        filtered = filtered.filter(tc => {
          // Nếu tiêu chí không có phòng ban (áp dụng cho tất cả) hoặc trùng với phòng ban đang lọc
          return tc.id_phong_ban === null || tc.id_phong_ban === '' ||
            tc.id_phong_ban === parseInt(this.filters.phongBan);
        });
      }

      if (this.filters.chucDanh !== '') {
        filtered = filtered.filter(tc => {
          // Nếu tiêu chí không có chức danh (áp dụng cho tất cả) hoặc trùng với chức danh đang lọc
          return tc.id_chuc_danh === null || tc.id_chuc_danh === '' ||
            tc.id_chuc_danh === parseInt(this.filters.chucDanh);
        });
      }

      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        filtered = filtered.filter(tc =>
          tc.ten_tieu_chi.toLowerCase().includes(searchTerm) ||
          (tc.mo_ta && tc.mo_ta.toLowerCase().includes(searchTerm))
        );
      }

      // Phân trang
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filtered.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.tieuChis.length / this.itemsPerPage);
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
      this.tieuChiModal = new Modal(this.$refs.tieuChiModal);
      this.deleteModal = new Modal(this.$refs.deleteModal);
    },
    async fetchData() {
      try {
        // Fetch tiêu chí KPI
        const tieuChiResponse = await axios.get('http://127.0.0.1:8000/api/tieu-chi-kpi');
        this.tieuChis = tieuChiResponse.data;

        // Fetch phòng ban
        const phongBanResponse = await axios.get('http://127.0.0.1:8000/api/phong-ban');
        this.phongBans = phongBanResponse.data;

        // Fetch chức danh
        const chucDanhResponse = await axios.get('http://127.0.0.1:8000/api/chuc-danh');
        this.chucDanhs = chucDanhResponse.data;
      } catch (error) {
        console.error('Error fetching data:', error);

        // Dữ liệu mẫu nếu API không hoạt động
        this.phongBans = [
          { id_phong_ban: 1, ten_phong_ban: 'Phòng Nhân sự' },
          { id_phong_ban: 2, ten_phong_ban: 'Phòng Kế toán' },
          { id_phong_ban: 3, ten_phong_ban: 'Phòng IT' }
        ];

        this.chucDanhs = [
          { id_chuc_danh: 1, ten_chuc_danh: 'Giám đốc' },
          { id_chuc_danh: 2, ten_chuc_danh: 'Trưởng phòng' },
          { id_chuc_danh: 3, ten_chuc_danh: 'Nhân viên' }
        ];

        this.tieuChis = [
          {
            id_tieu_chi: 1,
            ten_tieu_chi: 'Hiệu suất công việc',
            mo_ta: 'Đánh giá khả năng hoàn thành công việc đúng thời hạn và chất lượng',
            trong_so: 30,
            id_phong_ban: null,
            id_chuc_danh: null
          },
          {
            id_tieu_chi: 2,
            ten_tieu_chi: 'Chất lượng công việc',
            mo_ta: 'Đánh giá độ chính xác và chất lượng của sản phẩm/dịch vụ',
            trong_so: 25,
            id_phong_ban: null,
            id_chuc_danh: null
          },
          {
            id_tieu_chi: 3,
            ten_tieu_chi: 'Tinh thần làm việc nhóm',
            mo_ta: 'Đánh giá khả năng phối hợp và làm việc với đồng nghiệp',
            trong_so: 15,
            id_phong_ban: null,
            id_chuc_danh: null
          },
          {
            id_tieu_chi: 4,
            ten_tieu_chi: 'Kỹ năng lập trình',
            mo_ta: 'Đánh giá kỹ năng viết code, debug và tối ưu hóa',
            trong_so: 40,
            id_phong_ban: 3,
            id_chuc_danh: 3
          },
          {
            id_tieu_chi: 5,
            ten_tieu_chi: 'Kỹ năng quản lý nhân sự',
            mo_ta: 'Đánh giá khả năng quản lý, phân công và đánh giá nhân viên',
            trong_so: 35,
            id_phong_ban: null,
            id_chuc_danh: 2
          }
        ];
      }
    },
    getPhongBanName(id) {
      if (!id) return 'Tất cả phòng ban';
      const phongBan = this.phongBans.find(pb => pb.id_phong_ban === id);
      return phongBan ? phongBan.ten_phong_ban : 'Không xác định';
    },
    getChucDanhName(id) {
      if (!id) return 'Tất cả chức danh';
      const chucDanh = this.chucDanhs.find(cd => cd.id_chuc_danh === id);
      return chucDanh ? chucDanh.ten_chuc_danh : 'Không xác định';
    },
    resetForm() {
      this.formData = {
        ten_tieu_chi: '',
        mo_ta: '',
        trong_so: 10,
        id_phong_ban: '',
        id_chuc_danh: ''
      };
    },
    showAddModal() {
      this.isEditing = false;
      this.resetForm();
      this.tieuChiModal.show();
    },
    editTieuChi(tieuChi) {
      this.isEditing = true;
      this.selectedTieuChi = tieuChi;
      this.formData = { ...tieuChi };
      this.tieuChiModal.show();
    },
    deleteTieuChi(tieuChi) {
      this.selectedTieuChi = tieuChi;
      this.deleteModal.show();
    },
    async saveTieuChi() {
      try {
        if (this.isEditing) {
          // Cập nhật tiêu chí
          await axios.put(`http://127.0.0.1:8000/api/tieu-chi-kpi/${this.selectedTieuChi.id_tieu_chi}`, this.formData);

          // Cập nhật dữ liệu trong mảng
          const index = this.tieuChis.findIndex(tc => tc.id_tieu_chi === this.selectedTieuChi.id_tieu_chi);
          if (index !== -1) {
            this.tieuChis[index] = { ...this.tieuChis[index], ...this.formData };
          }

          alert('Cập nhật tiêu chí thành công!');
        } else {
          // Thêm tiêu chí mới
          const response = await axios.post('http://127.0.0.1:8000/api/tieu-chi-kpi', this.formData);
          this.tieuChis.push(response.data);

          alert('Thêm tiêu chí thành công!');
        }

        this.tieuChiModal.hide();
        this.resetForm();
      } catch (error) {
        console.error('Error saving criteria:', error);
        alert(`Lỗi khi lưu tiêu chí: ${error.response?.data?.message || error.message}`);
      }
    },
    async confirmDelete() {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/tieu-chi-kpi/${this.selectedTieuChi.id_tieu_chi}`);

        // Xóa tiêu chí khỏi mảng
        this.tieuChis = this.tieuChis.filter(tc => tc.id_tieu_chi !== this.selectedTieuChi.id_tieu_chi);

        alert('Xóa tiêu chí thành công!');
        this.deleteModal.hide();
      } catch (error) {
        console.error('Error deleting criteria:', error);
        alert(`Lỗi khi xóa tiêu chí: ${error.response?.data?.message || error.message}`);
      }
    }
  }
};
</script>

<style scoped>
.badge {
  font-size: 0.85rem;
  padding: 0.35em 0.65em;
}

.table th {
  white-space: nowrap;
}
</style>
