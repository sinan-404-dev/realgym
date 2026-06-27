// =====================================================
//  RealGym — Client Portal Logic (Firebase version)
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    // ── DOM Elements ──────────────────────────────────
    const navHome       = document.getElementById("nav-home");
    const navFacilities = document.getElementById("nav-facilities");
    const navPricing    = document.getElementById("nav-pricing");
    const navResults    = document.getElementById("nav-results");
    const navDashboard  = document.getElementById("nav-dashboard");
    const navPortalBtn  = document.getElementById("nav-portal-btn");
    const navCtaBtn     = document.getElementById("nav-cta-btn");

    const viewLanding   = document.getElementById("view-landing");
    const viewDashboard = document.getElementById("view-dashboard");

    const heroCtaBtn    = document.getElementById("hero-cta-btn");
    const heroPricingBtn= document.getElementById("hero-pricing-btn");

    const authModal      = document.getElementById("auth-modal");
    const closeAuthModal = document.getElementById("close-auth-modal");
    const goToRegister   = document.getElementById("go-to-register");
    const goToLogin      = document.getElementById("go-to-login");

    const loginForm    = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    // ── App State ─────────────────────────────────────
    let currentUser = RealGymDB.getCurrentUser();
    updateNavigation();
    renderResults();  // Load results gallery from Firebase

    if (currentUser) {
        loadDashboardData();
    }

    // ── View Switching ─────────────────────────────────
    function switchView(viewName) {
        if (viewName === "landing") {
            viewLanding.classList.add("active");
            viewDashboard.classList.remove("active");
            navHome.classList.add("active");
            navDashboard.classList.remove("active");
            if (navPricing)    navPricing.classList.remove("active");
            if (navFacilities) navFacilities.classList.remove("active");
            if (navResults)    navResults.classList.remove("active");
        } else if (viewName === "dashboard") {
            if (!currentUser) { openAuth("login"); return; }
            viewLanding.classList.remove("active");
            viewDashboard.classList.add("active");
            navHome.classList.remove("active");
            navDashboard.classList.add("active");
            if (navPricing)    navPricing.classList.remove("active");
            if (navFacilities) navFacilities.classList.remove("active");
            if (navResults)    navResults.classList.remove("active");
            loadDashboardData();
        }
    }

    function scrollToSection(selector, activeNavEl = null) {
        switchView("landing");
        setTimeout(() => {
            const el = document.querySelector(selector);
            if (el) {
                el.scrollIntoView({ behavior: "smooth" });
                navHome.classList.remove("active");
                if (navFacilities) navFacilities.classList.remove("active");
                if (navPricing)    navPricing.classList.remove("active");
                if (navResults)    navResults.classList.remove("active");
                if (activeNavEl)   activeNavEl.classList.add("active");
            }
        }, 100);
    }

    // ── Nav Listeners ──────────────────────────────────
    navHome.addEventListener("click", e => {
        e.preventDefault();
        switchView("landing");
        window.scrollTo({ top: 0, behavior: "smooth" });
        navHome.classList.add("active");
        if (navFacilities) navFacilities.classList.remove("active");
        if (navPricing)    navPricing.classList.remove("active");
        if (navResults)    navResults.classList.remove("active");
    });

    if (navFacilities) navFacilities.addEventListener("click", e => { e.preventDefault(); scrollToSection("#section-facilities", navFacilities); });
    if (navPricing)    navPricing.addEventListener("click",    e => { e.preventDefault(); scrollToSection(".pricing-grid", navPricing); });
    if (navResults)    navResults.addEventListener("click",    e => { e.preventDefault(); scrollToSection("#section-results", navResults); });

    navDashboard.addEventListener("click", e => { e.preventDefault(); switchView("dashboard"); });

    navPortalBtn.addEventListener("click", e => {
        e.preventDefault();
        currentUser ? switchView("dashboard") : openAuth("login");
    });

    heroCtaBtn.addEventListener("click", () => {
        currentUser ? switchView("dashboard") : openAuth("login");
    });

    if (navCtaBtn) {
        navCtaBtn.addEventListener("click", () => {
            if (currentUser) {
                currentUser = null;
                RealGymDB.setCurrentUser(null);
                updateNavigation();
                switchView("landing");
                showToast("Logged out successfully.");
            } else {
                openAuth("register");
            }
        });
    }

    if (heroPricingBtn) {
        heroPricingBtn.addEventListener("click", () => scrollToSection(".pricing-grid", navPricing));
    }

    document.querySelectorAll(".plan-select-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const selectedTier = btn.getAttribute("data-tier");
            const dd = document.getElementById("register-tier");
            if (dd) dd.value = selectedTier;
            openAuth("register");
        });
    });

    // ── Auth Modal ────────────────────────────────────
    function openAuth(mode = "login") {
        authModal.classList.add("active");
        if (mode === "register") {
            loginForm.style.display    = "none";
            registerForm.style.display = "block";
            document.getElementById("auth-modal-title").innerHTML = "CREATE <span class='green-accent'>ACCOUNT</span>";
        } else {
            loginForm.style.display    = "block";
            registerForm.style.display = "none";
            document.getElementById("auth-modal-title").innerHTML = "CLIENT <span class='green-accent'>PORTAL</span>";
        }
    }

    function closeAuth() { authModal.classList.remove("active"); }
    closeAuthModal.addEventListener("click", closeAuth);
    authModal.addEventListener("click", e => { if (e.target === authModal) closeAuth(); });
    goToRegister.addEventListener("click", e => { e.preventDefault(); openAuth("register"); });
    goToLogin.addEventListener("click",    e => { e.preventDefault(); openAuth("login"); });

    // ── Session UI ────────────────────────────────────
    function updateNavigation() {
        if (currentUser) {
            navDashboard.style.display  = "block";
            navPortalBtn.style.display  = "none";
            if (navCtaBtn) {
                navCtaBtn.innerText     = "Logout";
                navCtaBtn.className     = "button secondary danger-hover-btn";
                navCtaBtn.style.background    = "transparent";
                navCtaBtn.style.border        = "2px solid #ff3939";
                navCtaBtn.style.color         = "#ff3939";
                navCtaBtn.style.borderRadius  = "30px";
            }
        } else {
            navDashboard.style.display  = "none";
            navPortalBtn.style.display  = "block";
            if (navCtaBtn) {
                navCtaBtn.innerText           = "Join Now";
                navCtaBtn.className           = "button";
                navCtaBtn.style.background    = "";
                navCtaBtn.style.border        = "";
                navCtaBtn.style.color         = "";
                navCtaBtn.style.borderRadius  = "30px";
            }
        }
    }

    // ── Login (Firebase) ──────────────────────────────
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const phoneInput    = document.getElementById("login-phone").value.trim();
        const memberIdInput = document.getElementById("login-member-id").value.trim().toUpperCase();

        const submitBtn = loginForm.querySelector("button[type='submit']");
        if (submitBtn) { submitBtn.disabled = true; submitBtn.innerText = "Verifying…"; }

        try {
            const member = await RealGymDB.getMemberByPhoneAndId(phoneInput, memberIdInput);

            if (member) {
                if (member.status === "inactive") {
                    showToast("Your membership is inactive. Contact administration.", true);
                    return;
                }
                currentUser = member;
                RealGymDB.setCurrentUser(currentUser);
                updateNavigation();
                closeAuth();
                switchView("dashboard");
                showToast(`Welcome back, ${member.name}! 💪`);
            } else {
                showToast("Invalid phone or Member ID. Contact admin if you need help.", true);
            }
        } catch (err) {
            console.error("Login error:", err);
            showToast("Login failed. Check internet connection.", true);
        } finally {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.innerText = "Login"; }
        }
    });

    // Plan pricing config mapping
    const PLAN_PRICES = {
        "Monthly": 1000,
        "Quarterly": 2999,
        "Half-Yearly": 5499,
        "Elite Annual": 9999
    };

    // ── Register (Firebase + Razorpay Gateway) ────────
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name     = document.getElementById("register-name").value.trim();
        const password = document.getElementById("register-password").value;
        const phone    = document.getElementById("register-phone").value.trim();
        const tier     = document.getElementById("register-tier").value;

        const submitBtn = document.getElementById("register-submit-btn");
        if (submitBtn) { submitBtn.disabled = true; submitBtn.innerText = "Processing Payment…"; }

        try {
            const existing = await RealGymDB.getMemberByPhone(phone);
            if (existing) {
                showToast("This phone number is already registered.", true);
                if (submitBtn) { submitBtn.disabled = false; submitBtn.innerText = "Pay & Register Account"; }
                return;
            }

            const price = PLAN_PRICES[tier] || 1000;
            const amountInPaise = price * 100; // Razorpay needs subunits (paise)

            // Setup Razorpay checkout options
            const options = {
                "key": RAZORPAY_KEY_ID, 
                "amount": amountInPaise.toString(),
                "currency": "INR",
                "name": "RealGym Orimukku",
                "description": `Registration: ${tier} Plan`,
                "image": "gym-logo.png",
                "handler": async function (response) {
                    try {
                        const paymentId = response.razorpay_payment_id;
                        const memberId   = "RG-" + Math.floor(10000 + Math.random() * 90000);
                        const today      = new Date();
                        const dateJoined = today.toISOString().split("T")[0];

                        const renewalDateObj = new Date();
                        if      (tier === "Monthly")      renewalDateObj.setMonth(today.getMonth() + 1);
                        else if (tier === "Quarterly")    renewalDateObj.setMonth(today.getMonth() + 3);
                        else if (tier === "Half-Yearly")  renewalDateObj.setMonth(today.getMonth() + 6);
                        else if (tier === "Elite Annual") renewalDateObj.setMonth(today.getMonth() + 12);
                        else                              renewalDateObj.setMonth(today.getMonth() + 1);

                        const renewalDate = renewalDateObj.toISOString().split("T")[0];

                        const newMember = {
                            email: phone,
                            password,
                            name,
                            memberId,
                            tier,
                            phone,
                            status: "active",
                            dateJoined,
                            renewalDate,
                            lastPaymentId: paymentId,
                            lastPaymentAmount: price,
                            lastPaymentDate: dateJoined
                        };

                        await RealGymDB.addMember(newMember);
                        currentUser = newMember;
                        RealGymDB.setCurrentUser(currentUser);

                        updateNavigation();
                        closeAuth();
                        switchView("dashboard");
                        showToast(`🎉 Registration & Payment Successful! Member ID: ${memberId}`);
                    } catch (err) {
                        console.error("Error creating member record post-payment:", err);
                        showToast("Payment captured, but database update failed. Contact Admin.", true);
                    }
                },
                "prefill": {
                    "name": name,
                    "contact": phone
                },
                "theme": {
                    "color": "#39FF14"
                },
                "modal": {
                    "ondismiss": function() {
                        showToast("Payment cancelled by user.", true);
                        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerText = "Pay & Register Account"; }
                    }
                }
            };

            const rzp = new Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error("Register check error:", err);
            showToast("Registration check failed.", true);
            if (submitBtn) { submitBtn.disabled = false; submitBtn.innerText = "Pay & Register Account"; }
        }
    });

    // ── Dashboard Data (Firebase) ─────────────────────
    async function loadDashboardData() {
        if (!currentUser) return;

        try {
            // Fetch fresh user data from Firebase
            const freshUser = await RealGymDB.getMemberByPhone(currentUser.phone);
            if (freshUser) {
                currentUser = freshUser;
                RealGymDB.setCurrentUser(currentUser);
            }

            if (currentUser.status !== "active") {
                currentUser = null;
                RealGymDB.setCurrentUser(null);
                updateNavigation();
                switchView("landing");
                showToast("Your membership has been modified by admin.", true);
                return;
            }

            // Populate UI
            document.getElementById("dashboard-welcome-msg").innerText = `Welcome back, ${currentUser.name}!`;
            document.getElementById("member-name").innerText           = currentUser.name;
            document.getElementById("member-id").innerText             = currentUser.memberId;

            const phoneEl = document.getElementById("member-phone");
            if (phoneEl) phoneEl.innerText = currentUser.phone || "N/A";

            const statusBadge = document.getElementById("member-status-badge");
            statusBadge.className = `badge ${currentUser.status}`;
            statusBadge.innerText = currentUser.status;

            const tierBadge = document.getElementById("member-tier-badge");
            tierBadge.className = `badge tier-${currentUser.tier.toLowerCase().replace(/ /g, "-")}`;
            tierBadge.innerText = currentUser.tier;

            document.getElementById("member-since").innerText   = formatDateString(currentUser.dateJoined);
            document.getElementById("member-renewal").innerText = formatDateString(currentUser.renewalDate);

            // Days remaining
            const renDate  = new Date(currentUser.renewalDate);
            const currDate = new Date();
            currDate.setHours(0, 0, 0, 0);
            renDate.setHours(0, 0, 0, 0);
            const isExpired = currDate > renDate;
            const diffDays  = Math.ceil(Math.abs(renDate - currDate) / 86400000);

            const daysLeftEl = document.getElementById("member-days-left");
            if (daysLeftEl) {
                if (isExpired) {
                    daysLeftEl.innerText    = `Expired ${diffDays} Days Ago`;
                    daysLeftEl.style.color  = "#ff3b30";
                } else {
                    daysLeftEl.innerText    = `${diffDays} Days Left`;
                    daysLeftEl.style.color  = "#39FF14";
                }
            }

            // WhatsApp Support renew config
            const renewWaBtn = document.getElementById("client-renew-wa-btn");
            if (renewWaBtn) {
                const msg = `Hello Team AbuSinan, I would like to renew my RealGym membership.\n- Name: ${currentUser.name}\n- Member ID: ${currentUser.memberId}\n- Plan: ${currentUser.tier}\n- Renewal Date: ${currentUser.renewalDate}`;
                renewWaBtn.href = `https://wa.me/919447771658?text=${encodeURIComponent(msg)}`;
            }

            // Online Payment renew handler
            const payBtn = document.getElementById("client-pay-online-btn");
            if (payBtn) {
                // Clear old listeners
                const newPayBtn = payBtn.cloneNode(true);
                payBtn.parentNode.replaceChild(newPayBtn, payBtn);

                newPayBtn.addEventListener("click", () => {
                    newPayBtn.disabled = true;
                    newPayBtn.innerText = "Opening Gateway…";

                    const price = PLAN_PRICES[currentUser.tier] || 1000;
                    const amountInPaise = price * 100;

                    const options = {
                        "key": RAZORPAY_KEY_ID,
                        "amount": amountInPaise.toString(),
                        "currency": "INR",
                        "name": "RealGym Orimukku",
                        "description": `Renewal: ${currentUser.tier} Plan`,
                        "image": "gym-logo.png",
                        "handler": async function (response) {
                            try {
                                const paymentId = response.razorpay_payment_id;
                                const today = new Date();
                                const currentRenewal = new Date(currentUser.renewalDate);

                                // If renewal date is in the future, extend from that date. If expired, extend from today!
                                let baseDate = today > currentRenewal ? today : currentRenewal;
                                const newDate = new Date(baseDate);

                                if      (currentUser.tier === "Monthly")      newDate.setMonth(baseDate.getMonth() + 1);
                                else if (currentUser.tier === "Quarterly")    newDate.setMonth(baseDate.getMonth() + 3);
                                else if (currentUser.tier === "Half-Yearly")  newDate.setMonth(baseDate.getMonth() + 6);
                                else if (currentUser.tier === "Elite Annual") newDate.setMonth(baseDate.getMonth() + 12);
                                else                                          newDate.setMonth(baseDate.getMonth() + 1);

                                const newRenewalDate = newDate.toISOString().split("T")[0];

                                await RealGymDB.updateMember(currentUser.phone, {
                                    renewalDate: newRenewalDate,
                                    status: "active",
                                    lastPaymentId: paymentId,
                                    lastPaymentAmount: price,
                                    lastPaymentDate: today.toISOString().split("T")[0]
                                });

                                showToast(`✅ Renewed Successfully until ${newRenewalDate}!`);
                                loadDashboardData();
                            } catch (err) {
                                console.error("Error executing renewal update:", err);
                                showToast("PaymentCaptured, database update error.", true);
                            }
                        },
                        "prefill": {
                            "name": currentUser.name,
                            "contact": currentUser.phone
                        },
                        "theme": {
                            "color": "#39FF14"
                        },
                        "modal": {
                            "ondismiss": function() {
                                showToast("Payment cancelled.", true);
                                newPayBtn.disabled = false;
                                newPayBtn.innerText = "Pay & Renew Online";
                            }
                        }
                    };

                    const rzp = new Razorpay(options);
                    rzp.open();
                });
            }

        } catch (err) {
            console.error("Dashboard load error:", err);
        }
    }

    function formatDateString(str) {
        if (!str) return "N/A";
        return new Date(str).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }

    // ── Results Gallery (Firebase Storage) ───────────
    async function renderResults() {
        const container = document.getElementById("results-container");
        if (!container) return;

        try {
            const results = await RealGymDB.getResults();
            if (results.length === 0) {
                container.innerHTML = `<div style="text-align:center;color:#555;padding:40px;grid-column:1/-1;">No transformation photos yet. Check back soon!</div>`;
                return;
            }
            container.innerHTML = results.map(res => {
                if (!res.image) return "";
                return `
                    <div class="facility-item"
                         style="border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.03);background:#111;box-sizing:border-box;display:flex;align-items:center;justify-content:center;">
                        <img src="${res.image}"
                             style="width:100%;height:auto;display:block;object-fit:contain;"
                             alt="RealGym Transformation">
                    </div>`;
            }).join("");
        } catch (err) {
            console.error("Results load error:", err);
        }
    }
});
