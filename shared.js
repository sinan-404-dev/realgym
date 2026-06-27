// =====================================================
//  RealGym — Firebase Database Layer
//  Replaces localStorage with Google Firestore + Storage
//  All methods are async (use await when calling)
// =====================================================

const RealGymDB = {

    // ─────────────────────────────────────────────────
    //  MEMBERS
    // ─────────────────────────────────────────────────

    /** Get all members from Firestore */
    async getMembers() {
        const snapshot = await db.collection("members").get();
        return snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
    },

    /** Find a member by phone number */
    async getMemberByPhone(phone) {
        const clean = phone.replace(/\D/g, "");
        const members = await this.getMembers();
        return members.find(m => {
            const dbClean = m.phone ? m.phone.replace(/\D/g, "") : "";
            return dbClean === clean;
        }) || null;
    },

    /** Find a member by phone AND memberId (client login) */
    async getMemberByPhoneAndId(phone, memberId) {
        const clean = phone.replace(/\D/g, "");
        const members = await this.getMembers();
        return members.find(m => {
            const dbClean = m.phone ? m.phone.replace(/\D/g, "") : "";
            return dbClean === clean &&
                   m.memberId.toUpperCase() === memberId.trim().toUpperCase();
        }) || null;
    },

    /** Add a new member — document ID = cleaned phone number */
    async addMember(member) {
        const cleanPhone = member.phone.replace(/\D/g, "");
        await db.collection("members").doc(cleanPhone).set(member);
        return member;
    },

    /** Update specific fields on a member */
    async updateMember(phone, updates) {
        const cleanPhone = phone.replace(/\D/g, "");
        await db.collection("members").doc(cleanPhone).update(updates);
    },

    /** Delete a member */
    async deleteMember(phone) {
        const cleanPhone = phone.replace(/\D/g, "");
        await db.collection("members").doc(cleanPhone).delete();
    },

    // ─────────────────────────────────────────────────
    //  RESULTS / TRANSFORMATION PHOTOS
    // ─────────────────────────────────────────────────

    /** Get all result images */
    async getResults() {
        try {
            const snapshot = await db.collection("results")
                .orderBy("uploadedAt", "desc").get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch(e) {
            // Fallback if index not yet built
            const snapshot = await db.collection("results").get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
    },

    /**
     * Compress an image file using Canvas and store as Base64 in Firestore.
     * Works 100% free — no Firebase Storage upgrade needed!
     * @param {File} file  — the image file from <input type="file">
     */
    async addResult(file) {
        // Compress image using Canvas (max 800px wide, quality 0.75)
        const compressed = await compressImage(file, 800, 0.75);

        const resultData = {
            image: compressed,       // Base64 string stored in Firestore
            filename: file.name,
            uploadedAt: new Date().toISOString()
        };
        const docRef = await db.collection("results").add(resultData);
        return { id: docRef.id, ...resultData };
    },

    /** Delete a result image record */
    async deleteResult(id) {
        await db.collection("results").doc(id).delete();
    },

    // ─────────────────────────────────────────────────
    //  SESSION — kept in sessionStorage (per tab)
    // ─────────────────────────────────────────────────

    getCurrentUser() {
        const u = sessionStorage.getItem("rg_current_user");
        return u ? JSON.parse(u) : null;
    },

    setCurrentUser(user) {
        if (user) sessionStorage.setItem("rg_current_user", JSON.stringify(user));
        else       sessionStorage.removeItem("rg_current_user");
    },

    getCurrentAdmin() {
        const a = sessionStorage.getItem("rg_current_admin");
        return a ? JSON.parse(a) : null;
    },

    setCurrentAdmin(admin) {
        if (admin) sessionStorage.setItem("rg_current_admin", JSON.stringify(admin));
        else       sessionStorage.removeItem("rg_current_admin");
    }
};

// ─────────────────────────────────────────────────────
//  Image Compression Helper (Canvas API — no Storage needed)
//  Compresses any image file to Base64 JPEG under ~500KB
// ─────────────────────────────────────────────────────
function compressImage(file, maxWidth = 800, quality = 0.75) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement("canvas");
                let width  = img.width;
                let height = img.height;

                // Scale down if wider than maxWidth
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width  = maxWidth;
                }

                canvas.width  = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to compressed JPEG Base64
                resolve(canvas.toDataURL("image/jpeg", quality));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ─────────────────────────────────────────────────────
//  Toast Notification Helper
// ─────────────────────────────────────────────────────
function showToast(message, isError = false) {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "toast-container";
        document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = `toast ${isError ? "error" : ""}`;
    toast.innerHTML = `
        <span style="font-size: 18px;">${isError ? "❌" : "⚡"}</span>
        <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = "slide-in 0.3s ease reverse forwards";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
