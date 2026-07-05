import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../libs/api";
import {
  ShieldAlert,
  UserPlus,
  Pencil,
  Trash2,
  X,
  ShieldCheck,
  UserCircle,
  AlertTriangle,
  Mail,
  Phone,
} from "lucide-react";

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "WAREHOUSE", label: "Warehouse Staff" },
  { value: "CASHIER", label: "Cashier" },
  { value: "SALES", label: "Sales Staff" },
];

const EMPTY_FORM = {
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  role: "SALES",
  phone_number: "",
  password: "",
};

function useScreenSize() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

export default function StaffManagement() {
  const isMobile = useScreenSize();

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    checkAccessAndFetchData();
  }, []);

  const checkAccessAndFetchData = async () => {
    const token = localStorage.getItem("access");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsAdmin(decoded.role === "ADMIN");
      } catch {
        setIsAdmin(false);
      }
    }

    fetchStaff();
  };

  const fetchStaff = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("accounts/staff/");
      const data = response.data;

      setStaffList(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Failed to fetch staff:", err);

      setStaffList([]);
      setError(
        "Failed to load staff list. Please confirm the staff API endpoint is available.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, user = null) => {
    setError("");
    setModalMode(mode);

    if (mode === "edit" && user) {
      setSelectedUserId(user.id);

      setFormData({
        username: user.username || "",
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        role: user.role || "SALES",
        phone_number: user.phone_number || "",
        password: "",
      });
    } else {
      setSelectedUserId(null);
      setFormData(EMPTY_FORM);
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
    setFormData(EMPTY_FORM);
    setError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const payload = { ...formData };

      if (modalMode === "edit" && !payload.password) {
        delete payload.password;
      }

      if (modalMode === "add") {
        await api.post("accounts/staff/", payload);
      } else {
        await api.patch(`accounts/staff/${selectedUserId}/`, payload);
      }

      handleCloseModal();
      fetchStaff();
    } catch (err) {
      console.error("Save failed:", err.response?.data);

      const backendError = err.response?.data;

      setError(
        backendError?.password?.[0] ||
          backendError?.email?.[0] ||
          backendError?.username?.[0] ||
          backendError?.detail ||
          "An error occurred while saving the staff account.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (user) => {
    setError("");
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await api.delete(`accounts/staff/${userToDelete.id}/`);

      setIsDeleteModalOpen(false);
      setUserToDelete(null);

      fetchStaff();
    } catch (err) {
      console.error("Deactivate failed:", err.response?.data);

      setError(
        err.response?.data?.detail ||
          "Failed to deactivate this staff account.",
      );

      setIsDeleteModalOpen(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "ADMIN":
        return { bg: "#fee2e2", text: "#b91c1c" };

      case "WAREHOUSE":
        return { bg: "#fef3c7", text: "#b45309" };

      case "CASHIER":
        return { bg: "#ccfbf1", text: "#0f766e" };

      default:
        return { bg: "#e0e7ff", text: "#4338ca" };
    }
  };

  const getRoleName = (role) =>
    ROLE_OPTIONS.find((item) => item.value === role)?.label || role;

  const renderRoleBadge = (role) => {
    const badge = getRoleBadgeColor(role);

    return (
      <span
        style={{
          ...styles.roleBadge,
          backgroundColor: badge.bg,
          color: badge.text,
        }}
      >
        {role === "ADMIN" && <ShieldCheck size={12} />}
        {getRoleName(role)}
      </span>
    );
  };

  return (
    <main
      style={{
        ...styles.container,
        ...(isMobile ? styles.containerMobile : {}),
      }}
    >
      <header
        style={{
          ...styles.header,
          ...(isMobile ? styles.headerMobile : {}),
        }}
      >
        <div>
          <p style={styles.eyebrow}>Access control</p>
          <h1 style={styles.title}>Staff Management</h1>

          <p style={styles.subtitle}>
            View and manage system access for your team.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => handleOpenModal("add")}
            style={{
              ...styles.primaryBtn,
              ...(isMobile ? styles.primaryBtnMobile : {}),
            }}
          >
            <UserPlus size={18} />
            Add New Staff
          </button>
        )}
      </header>

      {error && !isModalOpen && !isDeleteModalOpen && (
        <div style={styles.errorAlert}>{error}</div>
      )}

      {!isAdmin && (
        <div
          style={{
            ...styles.readOnlyBanner,
            ...(isMobile ? styles.readOnlyBannerMobile : {}),
          }}
        >
          <ShieldAlert size={20} color="#b45309" style={{ flexShrink: 0 }} />

          <p style={{ margin: 0 }}>
            You have <strong>Read-Only</strong> access. Only administrators can
            add, edit, or deactivate staff accounts.
          </p>
        </div>
      )}

      {loading ? (
        <div style={styles.emptyState}>Loading staff directory...</div>
      ) : staffList.length === 0 ? (
        <div style={styles.emptyState}>
          No staff accounts are available yet.
        </div>
      ) : isMobile ? (
        <section style={styles.mobileCardList}>
          {staffList.map((user) => (
            <article key={user.id} style={styles.mobileStaffCard}>
              <div style={styles.mobileCardHeader}>
                <div style={styles.userInfo}>
                  <div style={styles.avatar}>
                    <UserCircle size={34} color="#94a3b8" />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={styles.userName}>
                      {user.full_name || user.username}
                    </div>
                    <div style={styles.userHandle}>@{user.username}</div>
                  </div>
                </div>

                {renderRoleBadge(user.role)}
              </div>

              <div style={styles.mobileContactGroup}>
                <div style={styles.mobileContactRow}>
                  <Mail size={15} />
                  <span>{user.email || "No email address"}</span>
                </div>

                <div style={styles.mobileContactRow}>
                  <Phone size={15} />
                  <span>{user.phone_number || "No phone number"}</span>
                </div>
              </div>

              {isAdmin && (
                <div style={styles.mobileActions}>
                  <button
                    type="button"
                    onClick={() => handleOpenModal("edit", user)}
                    style={styles.editButton}
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteClick(user)}
                    style={styles.deactivateButton}
                  >
                    <Trash2 size={16} />
                    Deactivate
                  </button>
                </div>
              )}
            </article>
          ))}
        </section>
      ) : (
        <section style={styles.tableCard}>
          <div style={styles.tableScroll}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Phone</th>

                  {isAdmin && (
                    <th style={{ ...styles.th, textAlign: "right" }}>
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {staffList.map((user) => (
                  <tr key={user.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.userInfo}>
                        <div style={styles.avatar}>
                          <UserCircle size={28} color="#94a3b8" />
                        </div>

                        <div>
                          <div style={styles.userName}>
                            {user.full_name || user.username}
                          </div>
                          <div style={styles.userHandle}>@{user.username}</div>
                        </div>
                      </div>
                    </td>

                    <td style={styles.td}>{renderRoleBadge(user.role)}</td>

                    <td style={styles.tdText}>{user.email || "—"}</td>

                    <td style={styles.tdText}>{user.phone_number || "—"}</td>

                    {isAdmin && (
                      <td style={styles.tdActions}>
                        <button
                          type="button"
                          onClick={() => handleOpenModal("edit", user)}
                          style={styles.actionBtn}
                          title="Edit staff member"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteClick(user)}
                          style={{
                            ...styles.actionBtn,
                            color: "#dc2626",
                          }}
                          title="Deactivate staff member"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div
            style={{
              ...styles.modal,
              ...(isMobile ? styles.modalMobile : {}),
            }}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {modalMode === "add" ? "Add New Staff" : "Edit Staff Member"}
              </h2>

              <button
                type="button"
                onClick={handleCloseModal}
                style={styles.closeBtn}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {error && <div style={styles.errorAlert}>{error}</div>}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div
                style={{
                  ...styles.formRow,
                  ...(isMobile ? styles.formRowMobile : {}),
                }}
              >
                <label style={styles.label}>
                  Username *
                  <input
                    required
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </label>

                <label style={styles.label}>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </label>
              </div>

              <div
                style={{
                  ...styles.formRow,
                  ...(isMobile ? styles.formRowMobile : {}),
                }}
              >
                <label style={styles.label}>
                  First Name
                  <input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </label>

                <label style={styles.label}>
                  Last Name
                  <input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </label>
              </div>

              <div
                style={{
                  ...styles.formRow,
                  ...(isMobile ? styles.formRowMobile : {}),
                }}
              >
                <label style={styles.label}>
                  System Role *
                  <select
                    required
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    style={styles.input}
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={styles.label}>
                  Phone Number
                  <input
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </label>
              </div>

              <label style={styles.label}>
                {modalMode === "add"
                  ? "Password *"
                  : "Reset Password (Optional)"}

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={modalMode === "add"}
                  placeholder={
                    modalMode === "edit" ? "Leave blank to keep current" : ""
                  }
                  style={styles.input}
                />
              </label>

              <div
                style={{
                  ...styles.modalFooter,
                  ...(isMobile ? styles.modalFooterMobile : {}),
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    ...styles.cancelBtn,
                    ...(isMobile ? styles.fullWidthButton : {}),
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    ...styles.saveBtn,
                    ...(isMobile ? styles.fullWidthButton : {}),
                    opacity: isSaving ? 0.7 : 1,
                  }}
                >
                  {isSaving
                    ? "Saving..."
                    : modalMode === "add"
                      ? "Create User"
                      : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div style={styles.modalOverlay}>
          <div
            style={{
              ...styles.alertModal,
              ...(isMobile ? styles.alertModalMobile : {}),
            }}
          >
            <div style={styles.alertHeader}>
              <div style={styles.iconCircle}>
                <AlertTriangle size={28} color="#dc2626" />
              </div>

              <h3 style={styles.alertTitle}>Deactivate Staff Member?</h3>
            </div>

            <p style={styles.alertMessage}>
              Are you sure you want to deactivate{" "}
              <strong>{userToDelete?.username}</strong>? They will no longer be
              able to log in, but their historical records will remain safe.
            </p>

            <div
              style={{
                ...styles.modalFooter,
                ...(isMobile ? styles.modalFooterMobile : {}),
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setUserToDelete(null);
                }}
                style={{
                  ...styles.cancelBtn,
                  ...(isMobile ? styles.fullWidthButton : {}),
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                style={{
                  ...styles.deleteConfirmBtn,
                  ...(isMobile ? styles.fullWidthButton : {}),
                }}
              >
                Yes, Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "32px",
    background: "#f8fafc",
    color: "#0f172a",
    boxSizing: "border-box",
  },

  containerMobile: {
    padding: "16px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },

  headerMobile: {
    marginBottom: "18px",
  },

  eyebrow: {
    margin: 0,
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },

  title: {
    margin: "6px 0 0",
    fontSize: "28px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
  },

  subtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "15px",
  },

  readOnlyBanner: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "24px",
    padding: "12px 16px",
    border: "1px solid #fde68a",
    borderRadius: "10px",
    background: "#fef3c7",
    color: "#92400e",
    fontSize: "14px",
    lineHeight: 1.45,
  },

  readOnlyBannerMobile: {
    alignItems: "flex-start",
  },

  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    border: "none",
    borderRadius: "9px",
    padding: "11px 17px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },

  primaryBtnMobile: {
    width: "100%",
  },

  tableCard: {
    overflow: "hidden",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    background: "#ffffff",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },

  tableScroll: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "760px",
    borderCollapse: "collapse",
  },

  th: {
    padding: "16px",
    borderBottom: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.05em",
    textAlign: "left",
    textTransform: "uppercase",
  },

  tr: {
    borderBottom: "1px solid #f1f5f9",
  },

  td: {
    padding: "16px",
  },

  tdText: {
    padding: "16px",
    color: "#475569",
    fontSize: "14px",
  },

  tdActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    padding: "16px",
  },

  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  avatar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  userName: {
    overflow: "hidden",
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: "700",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  userHandle: {
    marginTop: "3px",
    color: "#94a3b8",
    fontSize: "13px",
  },

  roleBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "5px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800",
    whiteSpace: "nowrap",
  },

  actionBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    background: "transparent",
    color: "#64748b",
    cursor: "pointer",
  },

  mobileCardList: {
    display: "grid",
    gap: "12px",
  },

  mobileStaffCard: {
    padding: "16px",
    border: "1px solid #e2e8f0",
    borderRadius: "15px",
    background: "#ffffff",
    boxShadow: "0 3px 8px rgba(15, 23, 42, 0.035)",
  },

  mobileCardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
  },

  mobileContactGroup: {
    display: "grid",
    gap: "8px",
    marginTop: "16px",
    paddingTop: "14px",
    borderTop: "1px solid #f1f5f9",
  },

  mobileContactRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    overflow: "hidden",
    color: "#64748b",
    fontSize: "13px",
  },

  mobileActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "16px",
  },

  editButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    padding: "10px",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    background: "#eff6ff",
    color: "#2563eb",
    fontWeight: "700",
    cursor: "pointer",
  },

  deactivateButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    padding: "10px",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    background: "#fef2f2",
    color: "#dc2626",
    fontWeight: "700",
    cursor: "pointer",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "18px",
    overflowY: "auto",
    background: "rgba(15, 23, 42, 0.6)",
  },

  modal: {
    width: "100%",
    maxWidth: "550px",
    maxHeight: "calc(100vh - 36px)",
    overflowY: "auto",
    padding: "24px",
    borderRadius: "16px",
    background: "#ffffff",
    boxSizing: "border-box",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
  },

  modalMobile: {
    padding: "18px",
    borderRadius: "14px",
  },

  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "20px",
  },

  modalTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "800",
  },

  closeBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    background: "transparent",
    color: "#94a3b8",
    cursor: "pointer",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  formRow: {
    display: "flex",
    gap: "16px",
  },

  formRowMobile: {
    flexDirection: "column",
  },

  label: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    gap: "6px",
    color: "#475569",
    fontSize: "13px",
    fontWeight: "700",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
  },

  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "8px",
    paddingTop: "16px",
    borderTop: "1px solid #e2e8f0",
  },

  modalFooterMobile: {
    flexDirection: "column-reverse",
  },

  fullWidthButton: {
    width: "100%",
  },

  cancelBtn: {
    padding: "10px 16px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#475569",
    fontWeight: "700",
    cursor: "pointer",
  },

  saveBtn: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
  },

  alertModal: {
    width: "100%",
    maxWidth: "420px",
    padding: "30px",
    borderRadius: "16px",
    background: "#ffffff",
    textAlign: "center",
    boxSizing: "border-box",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
  },

  alertModalMobile: {
    padding: "22px 18px",
  },

  alertHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "14px",
    marginBottom: "16px",
  },

  iconCircle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    borderRadius: "50%",
    background: "#fef2f2",
  },

  alertTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "20px",
    fontWeight: "800",
  },

  alertMessage: {
    margin: 0,
    color: "#475569",
    fontSize: "15px",
    lineHeight: 1.55,
  },

  deleteConfirmBtn: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#dc2626",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
  },

  emptyState: {
    padding: "56px 20px",
    border: "1px dashed #cbd5e1",
    borderRadius: "14px",
    background: "#ffffff",
    color: "#64748b",
    textAlign: "center",
  },

  errorAlert: {
    marginBottom: "16px",
    padding: "12px",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    background: "#fef2f2",
    color: "#b91c1c",
    fontSize: "14px",
    lineHeight: 1.45,
  },
};
