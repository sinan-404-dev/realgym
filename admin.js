// =====================================================
//  RealGym — Admin Panel Logic (Firebase version)
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    // ── DOM Elements ──────────────────────────────────
    const adminLoginView     = document.getElementById("admin-login-view");
    const adminDashboardView = document.getElementById("admin-dashboard-view");
    const adminLoginForm     = document.getElementById("admin-login-form");
    const navLogout          = document.getElementById("nav-logout");

    const memberModal      = document.getElementById("admin-member-modal");
    const addMemberBtn     = document.getElementById("admin-add-member-btn");
    const closeMemberModal = document.getElementById("close-admin-member-modal");
    const memberForm       = document.getElementById("admin-member-form");

    const resultModal      = document.getElementById("admin-result-modal");
    const addResultBtn     = document.getElementById("admin-add-result-btn");
    const closeResultModal = document.getElementById("close-admin-result-modal");
    const resultForm       = document.getElementById("admin-result-form");

    // ── Session ──────────────────────────────────────
    let currentAdmin = RealGymDB.getCurrentAdmin();
    updateSessionUI();

    function updateSessionUI() {
        if (currentAdmin) {
            adminLoginView.classList.remove("active");
            adminDashboardView.classList.add("active");
            navLogout.style.display = "block";
            loadAdminDashboardData();
        } else {
            adminLoginView.classList.add("active");
            adminDashboardView.classList.remove("active");
            navLogout.style.display = "none";
        }
    }

    // ── Admin Login ───────────────────────────────────
    adminLoginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("admin-email").value.trim();
        const password = document.getElementById("admin-password").value;

        if (username === "abusinan" && password === "abusinan@admin@123") {
            currentAdmin = { username: "abusinan", role: "SuperAdmin" };
            RealGymDB.setCurrentAdmin(currentAdmin);
            updateSessionUI();
            showToast("Authenticated as administrator.");
        } else {
            showToast("Invalid administrator credentials.", true);
        }
    });

    navLogout.addEventListener("click", () => {
        currentAdmin = null;
        RealGymDB.setCurrentAdmin(null);
        updateSessionUI();
        showToast("Admin session ended.");
    });

    // ── Member Modal ──────────────────────────────────
    addMemberBtn.addEventListener("click", () => memberModal.classList.add("active"));
    const closeModal = () => memberModal.classList.remove("active");
    closeMemberModal.addEventListener("click", closeModal);
    memberModal.addEventListener("click", e => { if (e.target === memberModal) closeModal(); });

    // ── Result Modal ──────────────────────────────────
    addResultBtn.addEventListener("click", () => resultModal.classList.add("active"));
    const closeResModal = () => resultModal.classList.remove("active");
    closeResultModal.addEventListener("click", closeResModal);
    resultModal.addEventListener("click", e => { if (e.target === resultModal) closeResModal(); });

    // ── Load Dashboard ────────────────────────────────
    async function loadAdminDashboardData() {
        try {
            const members = await RealGymDB.getMembers();

            // Revenue estimate
            let monthlyRevenue = 0;
            members.forEach(m => {
                if (m.status === "active") {
                    if      (m.tier === "Monthly")      monthlyRevenue += 1000;
                    else if (m.tier === "Quarterly")    monthlyRevenue += 1000;
                    else if (m.tier === "Half-Yearly")  monthlyRevenue += 917;
                    else if (m.tier === "Elite Annual") monthlyRevenue += 833;
                }
            });

            const activeMembers = members.filter(m => m.status === "active").length;

            document.getElementById("admin-stat-members").innerText        = members.length;
            document.getElementById("admin-stat-active-members").innerText = activeMembers;
            document.getElementById("admin-stat-workouts").innerText       = "—";
            document.getElementById("admin-stat-revenue").innerText        = `₹${monthlyRevenue.toLocaleString()}`;

            renderMembersTable(members);
            await renderAdminResults();

        } catch (err) {
            console.error("Dashboard load error:", err);
            showToast("Error loading data from Firebase.", true);
        }
    }

    // ── Members Table ─────────────────────────────────
    function renderMembersTable(members) {
        const tbody = document.getElementById("admin-members-table-body");
        if (!tbody) return;
        tbody.innerHTML = "";

        if (members.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="7" style="text-align:center;color:#666;padding:30px;">
                    No registered gym members found.
                </td></tr>`;
            return;
        }

        members.forEach(m => {
            const tr = document.createElement("tr");

            const joined  = formatDate(m.dateJoined);
            const renewal = formatDate(m.renewalDate);

            const renewalDateObj = new Date(m.renewalDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            renewalDateObj.setHours(0, 0, 0, 0);
            const isExpired = today > renewalDateObj;
            let daysExpired = 0;
            if (isExpired) {
                daysExpired = Math.ceil(Math.abs(today - renewalDateObj) / 86400000);
            }

            let cleanPhone = m.phone ? m.phone.replace(/\D/g, "") : "";
            if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;

            let waButtonHtml = "";
            if (isExpired && m.phone) {
                const msg = `Hello ${m.name}, your RealGym membership expired on ${m.renewalDate}. Please contact Team AbuSinan to renew your plan and continue your fitness journey!`;
                const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
                const col    = daysExpired >= 3 ? "#ff3b30" : "#39FF14";
                const bg     = daysExpired >= 3 ? "rgba(255,59,48,0.1)" : "rgba(57,255,20,0.1)";
                const border = daysExpired >= 3 ? "rgba(255,59,48,0.2)" : "rgba(57,255,20,0.2)";
                waButtonHtml = `
                    <a href="${waLink}" target="_blank"
                       title="Expired ${daysExpired} days. Click to send WhatsApp reminder."
                       style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;border:1px solid ${border};background:${bg};color:${col};transition:all 0.2s ease;text-decoration:none;">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328 0 11.94 0c3.202.001 6.212 1.248 8.477 3.517 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.618-5.33 11.944-11.944 11.944-2.005-.001-3.973-.503-5.729-1.46L0 24zm6.59-4.846c1.6.95 2.766 1.488 4.609 1.489 5.504 0 9.981-4.479 9.983-9.984.001-2.67-1.036-5.18-2.916-7.06C16.48 1.71 13.978 1.66 11.94 1.66c-5.508 0-9.985 4.479-9.988 9.988-.002 1.83.49 3.013 1.448 4.62l-.995 3.635 3.74-.98-.088.087zM17.487 14.39c-.3-.149-1.77-.874-2.045-.974-.275-.1-.475-.149-.675.15-.2.3-.77.974-.944 1.173-.175.2-.35.225-.65.075-.3-.15-1.265-.467-2.41-1.485-.89-.795-1.49-1.778-1.665-2.078-.175-.3-.018-.462.13-.61.137-.133.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.493-.51-.675-.52c-.172-.01-.37-.01-.567-.01-.197 0-.518.074-.79.37-.272.296-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.77-.724 2.02-1.424.25-.699.25-1.3.175-1.424-.075-.124-.275-.199-.575-.349z"/>
                        </svg>
                    </a>`;
            }

            const renewalColor = isExpired ? "#ff3b30" : "#39FF14";

            tr.innerHTML = `
                <td><div style="font-weight:600;color:#fff;">${m.name}</div></td>
                <td><code class="green-accent">${m.memberId}</code></td>
                <td><div style="font-weight:600;color:#39FF14;">📞 ${m.phone || "N/A"}</div></td>
                <td>
                    <span class="badge tier-${m.tier.toLowerCase().replace(/ /g,"-")}"
                          style="display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
                        ${m.tier}
                    </span>
                </td>
                <td>
                    <div style="font-size:11px;color:#888;">Joined: ${joined}</div>
                    <div style="font-size:11px;color:${renewalColor};margin-top:3px;">Renews: ${renewal}</div>
                </td>
                <td>
                    <div class="table-actions" style="display:flex;gap:8px;align-items:center;justify-content:flex-end;">
                        ${waButtonHtml}
                        <button onclick="adminRenewMemberPlan('${m.phone}')"
                                class="icon-btn"
                                style="background:rgba(57,255,20,0.1);color:#39FF14;border:1px solid rgba(57,255,20,0.2);padding:4px 8px !important;font-size:11px;margin:0;cursor:pointer;border-radius:4px;">
                            Renew
                        </button>
                        <button onclick="adminDeleteMember('${m.phone}')"
                                class="icon-btn delete-btn"
                                style="padding:4px 8px !important;font-size:11px;margin:0;">
                            Remove
                        </button>
                    </div>
                </td>`;
            tbody.appendChild(tr);
        });
    }

    function formatDate(dateStr) {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }

    // ── Global Admin Actions (called from table buttons) ──
    window.adminDeleteMember = async function(phone) {
        if (!confirm("Are you sure you want to delete this member?")) return;
        try {
            await RealGymDB.deleteMember(phone);
            showToast("Member deleted successfully.");
            await loadAdminDashboardData();
        } catch (err) {
            console.error(err);
            showToast("Error deleting member.", true);
        }
    };

    window.adminRenewMemberPlan = async function(phone) {
        try {
            const member = await RealGymDB.getMemberByPhone(phone);
            if (!member) return;

            const today   = new Date();
            const current = new Date(member.renewalDate);
            let baseDate  = today > current ? today : current;

            const newDate = new Date(baseDate);
            if      (member.tier === "Monthly")      newDate.setMonth(baseDate.getMonth() + 1);
            else if (member.tier === "Quarterly")    newDate.setMonth(baseDate.getMonth() + 3);
            else if (member.tier === "Half-Yearly")  newDate.setMonth(baseDate.getMonth() + 6);
            else if (member.tier === "Elite Annual") newDate.setMonth(baseDate.getMonth() + 12);
            else                                     newDate.setMonth(baseDate.getMonth() + 1);

            const newRenewalDate = newDate.toISOString().split("T")[0];
            await RealGymDB.updateMember(phone, { renewalDate: newRenewalDate, status: "active" });
            showToast(`✅ Renewed ${member.name} until ${newRenewalDate}`);
            await loadAdminDashboardData();
        } catch (err) {
            console.error(err);
            showToast("Error renewing membership.", true);
        }
    };

    // ── Register New Member ───────────────────────────
    memberForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name     = document.getElementById("admin-new-name").value.trim();
        const password = document.getElementById("admin-new-password").value;
        const phone    = document.getElementById("admin-new-phone").value.trim();
        const tier     = document.getElementById("admin-new-tier").value;

        if (!name || !phone || !tier) {
            showToast("Please fill in all required fields.", true);
            return;
        }

        try {
            // Check for duplicate phone
            const existing = await RealGymDB.getMemberByPhone(phone);
            if (existing) {
                showToast("This phone number is already registered.", true);
                return;
            }

            const memberId = "RG-" + Math.floor(10000 + Math.random() * 90000);
            const today    = new Date();
            const dateJoined = today.toISOString().split("T")[0];

            const renewalDateObj = new Date();
            if      (tier === "Monthly")      renewalDateObj.setMonth(today.getMonth() + 1);
            else if (tier === "Quarterly")    renewalDateObj.setMonth(today.getMonth() + 3);
            else if (tier === "Half-Yearly")  renewalDateObj.setMonth(today.getMonth() + 6);
            else if (tier === "Elite Annual") renewalDateObj.setMonth(today.getMonth() + 12);
            else                              renewalDateObj.setMonth(today.getMonth() + 1);

            const renewalDate = renewalDateObj.toISOString().split("T")[0];

            const newMember = {
                email: phone,          // internal identifier
                password,
                name,
                memberId,
                tier,
                phone,
                status: "active",
                dateJoined,
                renewalDate
            };

            await RealGymDB.addMember(newMember);
            showToast(`✅ Member registered: ${name} (${memberId})`);

            memberForm.reset();
            document.getElementById("admin-new-password").value = "password123";
            closeModal();
            await loadAdminDashboardData();

        } catch (err) {
            console.error(err);
            showToast("Error registering member. Check console.", true);
        }
    });

    // ── Results Table ─────────────────────────────────
    async function renderAdminResults() {
        const tbody = document.getElementById("admin-results-table-body");
        if (!tbody) return;

        try {
            const results = await RealGymDB.getResults();
            tbody.innerHTML = "";

            if (results.length === 0) {
                tbody.innerHTML = `
                    <tr><td colspan="4" style="text-align:center;color:#666;padding:30px;">
                        No transformation images published. Click '+ Add Result' to publish one.
                    </td></tr>`;
                return;
            }

            results.forEach(res => {
                const tr = document.createElement("tr");
                const shortName = res.filename || res.id;
                tr.innerHTML = `
                    <td><strong style="color:#fff;">${res.id.slice(0,8)}…</strong></td>
                    <td>
                        <div style="display:flex;align-items:center;gap:10px;">
                            <img src="${res.image}" style="width:50px;height:60px;object-fit:cover;border-radius:4px;border:1px solid rgba(255,255,255,0.1);" alt="Thumb">
                            <span style="font-family:monospace;color:#39FF14;font-size:12px;">${shortName}</span>
                        </div>
                    </td>
                    <td><span class="badge" style="background:rgba(57,255,20,0.15);color:#39FF14;font-size:11px;">Active Gallery</span></td>
                    <td style="text-align:right;">
                        <button class="action-btn delete-result-btn" data-id="${res.id}"
                                style="background:rgba(255,59,48,0.1);color:#ff3b30;border:1px solid rgba(255,59,48,0.2);padding:5px 10px;border-radius:4px;cursor:pointer;">
                            Delete
                        </button>
                    </td>`;
                tbody.appendChild(tr);
            });

            tbody.querySelectorAll(".delete-result-btn").forEach(btn => {
                btn.addEventListener("click", async (e) => {
                    const id = e.target.getAttribute("data-id");
                    if (confirm("Delete this transformation image?")) {
                        await RealGymDB.deleteResult(id);
                        showToast("Image removed from gallery.");
                        await renderAdminResults();
                    }
                });
            });

        } catch (err) {
            console.error("Results load error:", err);
            tbody.innerHTML = `<tr><td colspan="4" style="color:#ff3b30;text-align:center;padding:20px;">Error loading results from Firebase.</td></tr>`;
        }
    }

    // ── Result Upload ─────────────────────────────────
    if (resultForm) {
        resultForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const fileInput = document.getElementById("result-image-file");
            const file = fileInput.files[0];
            if (!file) { showToast("Please select an image file.", true); return; }

            const submitBtn = resultForm.querySelector("button[type='submit']");
            if (submitBtn) { submitBtn.disabled = true; submitBtn.innerText = "Uploading…"; }

            try {
                await RealGymDB.addResult(file);
                showToast("✅ Published to gallery successfully!");
                resultForm.reset();
                closeResModal();
                await renderAdminResults();
            } catch (err) {
                console.error("Upload error:", err);
                showToast("Upload failed. Check Firebase Storage rules.", true);
            } finally {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.innerText = "Publish Image"; }
            }
        });
    }

});
