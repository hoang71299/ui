<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Quản Lý Thẻ NFC</h5>
            <button class="btn btn-primary" @click="showAddModal">
              <i class="bx bx-plus me-1"></i> Thêm Thẻ NFC
            </button>
          </div>
          <div class="card-body">
            <!-- Bộ lọc -->
            <div class="row mb-3">
              <div class="col-md-3">
                <label class="form-label">Trạng Thái</label>
                <select class="form-select" v-model="filters.trangThai">
                  <option value="">Tất cả</option>
                  <option value="true">Đã cấp phát</option>
                  <option value="false">Chưa cấp phát</option>
                </select>
              </div>
              <div class="col-md-9">
                <label class="form-label">Tìm Kiếm</label>
                <input type="text" class="form-control" v-model="filters.search" placeholder="Mã thẻ, nhân viên...">
              </div>
            </div>

            <!-- Bảng danh sách thẻ NFC -->
            <div class="table-responsive">
              <table class="table table-bordered table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Mã Thẻ</th>
                    <th>UID</th>
                    <th>Nhân Viên</th>
                    <th>Ngày Cấp</th>
                    <th>Trạng Thái</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="the in filteredTheNFCs" :key="the.id_the">
                    <td>{{ the.id_the }}</td>
                    <td>{{ the.uid }}</td>
                    <td>{{ getNhanVienName(the.id_nhan_vien) }}</td>
                    <td>{{ formatDate(the.ngay_cap) }}</td>
                    <td>
                      <span :class="the.id_nhan_vien ? 'badge bg-success' : 'badge bg-secondary'">
                        {{ the.id_nhan_vien ? 'Đã cấp phát' : 'Chưa cấp phát' }}
                      </span>
                    </td>
                    <td>
                      <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-warning" @click="editTheNFC(the)">
                          <i class="bx bx-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" @click="deleteTheNFC(the)">
                          <i class="bx bx-trash"></i>
                        </button>
                        <button v-if="!the.id_nhan_vien" class="btn btn-sm btn-success" @click="assignCard(the)">
                          <i class="bx bx-user-plus"></i>
                        </button>
                        <button v-else class="btn btn-sm btn-info" @click="unassignCard(the)">
                          <i class="bx bx-user-minus"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredTheNFCs.length === 0">
                    <td colspan="6" class="text-center">Không có dữ liệu</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Phân trang -->
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                Hiển thị {{ filteredTheNFCs.length }} / {{ theNFCs.length }} thẻ
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

    <!-- Modal Thêm/Sửa Thẻ NFC -->
    <div class="modal fade" id="theNFCModal" tabindex="-1" aria-hidden="true" ref="theNFCModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Cập Nhật Thẻ NFC' : 'Thêm Thẻ NFC Mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveTheNFC">
              <div class="mb-3">
                <label class="form-label">UID Thẻ</label>
                <input type="text" class="form-control" v-model="formData.uid" required>
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
          <div class="modal-body" v-if="selectedTheNFC">
            <p>Bạn có chắc chắn muốn xóa thẻ NFC có UID <strong>{{ selectedTheNFC.uid }}</strong>?</p>
            <p class="text-danger">Hành động này không thể hoàn tác!</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">Xóa</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Cấp Phát Thẻ -->
    <div class="modal fade" id="assignModal" tabindex="-1" aria-hidden="true" ref="assignModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Cấp Phát Thẻ NFC</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedTheNFC">
            <form @submit.prevent="confirmAssign">
              <div class="mb-3">
                <label class="form-label">UID Thẻ</label>
                <input type="text" class="form-control" :value="selectedTheNFC.uid" disabled>
              </div>
              <div class="mb-3">
                <label class="form-label">Nhân Viên</label>
                <select class="form-select" v-model="assignData.id_nhan_vien" required>
                  <option value="">Chọn nhân viên</option>
                  <option v-for="nv in availableNhanViens" :key="nv.id_nhan_vien" :value="nv.id_nhan_vien">
                    {{ nv.ho_va_ten }} - {{ nv.id_nhan_vien }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Ngày Cấp</label>
                <input type="date" class="form-control" v-model="assignData.ngay_cap" required>
              </div>
              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Hủy</button>
                <button type="submit" class="btn btn-primary">Cấp Phát</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Xác Nhận Thu Hồi -->
    <div class="modal fade" id="unassignModal" tabindex="-1" aria-hidden="true" ref="unassignModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác Nhận Thu Hồi Thẻ</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" v-if="selectedTheNFC">
            <p>Bạn có chắc chắn muốn thu hồi thẻ NFC từ nhân viên <strong>{{
              getNhanVienName(selectedTheNFC.id_nhan_vien) }}</strong>?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-warning" @click="confirmUnassign">Thu Hồi</button>
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
  name: 'QuanLyTheNFC',
  data() {
    return {
      theNFCs: [],
      nhanViens: [],
      selectedTheNFC: null,
      isEditing: false,
      formData: {
        uid: ''
      },
      assignData: {
        id_nhan_vien: '',
        ngay_cap: new Date().toISOString().split('T')[0]
      },
      filters: {
        trangThai: '',
        search: ''
      },
      currentPage: 1,
      itemsPerPage: 10,
      theNFCModal: null,
      deleteModal: null,
      assignModal: null,
      unassignModal: null
    };
  },
  computed: {
    filteredTheNFCs() {
      let filtered = [...this.theNFCs];

      if (this.filters.trangThai !== '') {
        const hasNhanVien = this.filters.trangThai === 'true';
        filtered = filtered.filter(the => (the.id_nhan_vien !== null) === hasNhanVien);
      }

      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        filtered = filtered.filter(the => {
          const nhanVienName = this.getNhanVienName(the.id_nhan_vien).toLowerCase();
          return the.uid.toLowerCase().includes(searchTerm) ||
            nhanVienName.includes(searchTerm) ||
            (the.id_the && the.id_the.toString().includes(searchTerm));
        });
      }

      // Phân trang
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filtered.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.theNFCs.length / this.itemsPerPage);
    },
    availableNhanViens() {
      // Lọc nhân viên chưa được cấp thẻ hoặc là nhân viên hiện tại của thẻ đang chọn
      return this.nhanViens.filter(nv => {
        // Kiểm tra xem nhân viên đã có thẻ chưa
        const hasCard = this.theNFCs.some(the =>
          the.id_nhan_vien === nv.id_nhan_vien &&
          (!this.selectedTheNFC || the.id_the !== this.selectedTheNFC.id_the)
        );

        return !hasCard || (this.selectedTheNFC && this.selectedTheNFC.id_nhan_vien === nv.id_nhan_vien);
      });
    }
  },
  mounted() {
    this.fetchData();
    this.initModals();
  },
  methods: {
    initModals() {
      this.theNFCModal = new Modal(this.$refs.theNFCModal);
      this.deleteModal = new Modal(this.$refs.deleteModal);
      this.assignModal = new Modal(this.$refs.assignModal);
      this.unassignModal = new Modal(this.$refs.unassignModal);
    },
    async fetchData() {
      try {
        // Fetch thẻ NFC
        const theNFCResponse = await axios.get('http://127.0.0.1:8000/api/the-nfc');
        this.theNFCs = theNFCResponse.data;

        // Fetch nhân viên
        const nhanVienResponse = await axios.get('http://127.0.0.1:8000/api/nhan-vien');
        this.nhanViens = nhanVienResponse.data;
      } catch (error) {
        console.error('Error fetching data:', error);

        // Dữ liệu mẫu nếu API không hoạt động
        this.nhanViens = [
          {
            id_nhan_vien: 1,
            ho_va_ten: 'Nguyễn Văn A',
            email: 'nguyenvana@example.com',
            so_dien_thoai: '0123456789',
            trang_thai: true
          },
          {
            id_nhan_vien: 2,
            ho_va_ten: 'Trần Thị B',
            email: 'tranthib@example.com',
            so_dien_thoai: '0987654321',
            trang_thai: true
          },
          {
            id_nhan_vien: 3,
            ho_va_ten: 'Lê Văn C',
            email: 'levanc@example.com',
            so_dien_thoai: '0369852147',
            trang_thai: true
          }
        ];

        this.theNFCs = [
          {
            id_the: 1,
            uid: 'A1B2C3D4',
            id_nhan_vien: 1,
            ngay_cap: '2023-01-15'
          },
          {
            id_the: 2,
            uid: 'E5F6G7H8',
            id_nhan_vien: null,
            ngay_cap: null
          },
          {
            id_the: 3,
            uid: 'I9J0K1L2',
            id_nhan_vien: 2,
            ngay_cap: '2023-03-20'
          }
        ];
      }
    },
    getNhanVienName(id) {
      if (!id) return 'Chưa cấp phát';
      const nhanVien = this.nhanViens.find(nv => nv.id_nhan_vien === id);
      return nhanVien ? nhanVien.ho_va_ten : 'Không xác định';
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    },
    resetForm() {
      this.formData = {
        uid: ''
      };
    },
    resetAssignData() {
      this.assignData = {
        id_nhan_vien: '',
        ngay_cap: new Date().toISOString().split('T')[0]
      };
    },
    showAddModal() {
      this.isEditing = false;
      this.resetForm();
      this.theNFCModal.show();
    },
    editTheNFC(the) {
      this.isEditing = true;
      this.selectedTheNFC = the;
      this.formData = { uid: the.uid };
      this.theNFCModal.show();
    },
    deleteTheNFC(the) {
      this.selectedTheNFC = the;
      this.deleteModal.show();
    },
    assignCard(the) {
      this.selectedTheNFC = the;
      this.resetAssignData();
      this.assignModal.show();
    },
    unassignCard(the) {
      this.selectedTheNFC = the;
      this.unassignModal.show();
    },
    async saveTheNFC() {
      try {
        if (this.isEditing) {
          // Cập nhật thẻ NFC
          await axios.put(`http://127.0.0.1:8000/api/the-nfc/${this.selectedTheNFC.id_the}`, this.formData);

          // Cập nhật dữ liệu trong mảng
          const index = this.theNFCs.findIndex(the => the.id_the === this.selectedTheNFC.id_the);
          if (index !== -1) {
            this.theNFCs[index] = { ...this.theNFCs[index], uid: this.formData.uid };
          }
        } else {
          // Thêm thẻ NFC mới
          const response = await axios.post('http://127.0.0.1:8000/api/the-nfc', this.formData);
          this.theNFCs.push(response.data);
        }

        this.theNFCModal.hide();
        this.resetForm();
      } catch (error) {
        console.error('Error saving card:', error);
        alert('Có lỗi xảy ra khi lưu thông tin thẻ NFC!');
      }
    },
    async confirmDelete() {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/the-nfc/${this.selectedTheNFC.id_the}`);

        // Xóa thẻ khỏi mảng
        this.theNFCs = this.theNFCs.filter(the => the.id_the !== this.selectedTheNFC.id_the);

        this.deleteModal.hide();
      } catch (error) {
        console.error('Error deleting card:', error);
        alert('Có lỗi xảy ra khi xóa thẻ NFC!');
      }
    },
    async confirmAssign() {
      try {
        const updateData = {
          id_nhan_vien: this.assignData.id_nhan_vien,
          ngay_cap: this.assignData.ngay_cap
        };

        await axios.put(`http://127.0.0.1:8000/api/the-nfc/${this.selectedTheNFC.id_the}/assign`, updateData);

        // Cập nhật dữ liệu trong mảng
        const index = this.theNFCs.findIndex(the => the.id_the === this.selectedTheNFC.id_the);
        if (index !== -1) {
          this.theNFCs[index] = { ...this.theNFCs[index], ...updateData };
        }

        this.assignModal.hide();
        this.resetAssignData();
      } catch (error) {
        console.error('Error assigning card:', error);
        alert('Có lỗi xảy ra khi cấp phát thẻ NFC!');
      }
    },
    async confirmUnassign() {
      try {
        await axios.put(`http://127.0.0.1:8000/api/the-nfc/${this.selectedTheNFC.id_the}/unassign`);

        // Cập nhật dữ liệu trong mảng
        const index = this.theNFCs.findIndex(the => the.id_the === this.selectedTheNFC.id_the);
        if (index !== -1) {
          this.theNFCs[index] = { ...this.theNFCs[index], id_nhan_vien: null, ngay_cap: null };
        }

        this.unassignModal.hide();
      } catch (error) {
        console.error('Error unassigning card:', error);
        alert('Có lỗi xảy ra khi thu hồi thẻ NFC!');
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