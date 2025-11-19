// ====== Local DB + Sample Data ======
const DB = {
  key: "pbl_db_v1",
  load() {
    const raw = localStorage.getItem(this.key);
    if (!raw) {
      const sample = {
        students: [
          { username: "student1", password: "1234", name: "Student One",
            records: [
              { sem: 1, mid1: 18, mid2: 20, endsem: 72, cgpa: 7.8 },
              { sem: 2, mid1: 15, mid2: 17, endsem: 65, cgpa: 7.0 }
            ], cumulativeGPA: 7.4 },
          { username: "student2", password: "abcd", name: "Student Two",
            records: [
              { sem: 1, mid1: 12, mid2: 14, endsem: 50, cgpa: 6.0 },
              { sem: 2, mid1: 18, mid2: 19, endsem: 75, cgpa: 8.0 }
            ], cumulativeGPA: 7.0 }
        ],
        faculty: [
          { username: "faculty1", password: "1234", name: "Prof A", subject: "Maths", students: ["student1","student2"] }
        ]
      };
      localStorage.setItem(this.key, JSON.stringify(sample));
      return sample;
    }
    return JSON.parse(raw);
  },
  save(db) {
    localStorage.setItem(this.key, JSON.stringify(db));
  }
};
let DBdata = DB.load();

// ----- helpers
function findStudent(username) { return DBdata.students.find(s => s.username === username); }
function findFaculty(username) { return DBdata.faculty.find(f => f.username === username); }

// ===== Simple Linear Regression (multivariate) =====
function featureScale(X) {
  const m = X.length, n = X[0].length;
  const mu = new Array(n).fill(0);
  const sigma = new Array(n).fill(0);
  for (let j=0;j<n;j++){
    let sum=0;
    for (let i=0;i<m;i++) sum+=X[i][j];
    mu[j]=sum/m;
  }
  for (let j=0;j<n;j++){
    let s=0;
    for (let i=0;i<m;i++) s += Math.pow(X[i][j] - mu[j],2);
    sigma[j] = Math.sqrt(s/m) || 1;
  }
  const Xs = X.map(row => row.map((v,j) => (v - mu[j]) / sigma[j]));
  return { Xs, mu, sigma };
}

function gradientDescent(X, y, alpha=0.01, iters=2000) {
  const m = X.length;
  const n = X[0].length;
  let theta = new Array(n+1).fill(0);
  for (let iter=0; iter<iters; iter++){
    const preds = X.map(row => {
      let s = theta[0];
      for (let j=0;j<n;j++) s += theta[j+1]*row[j];
      return s;
    });
    const grad = new Array(n+1).fill(0);
    for (let i=0;i<m;i++){
      const err = preds[i] - y[i];
      grad[0] += err;
      for (let j=0;j<n;j++) grad[j+1] += err * X[i][j];
    }
    for (let k=0;k<n+1;k++){
      theta[k] = theta[k] - (alpha/m) * grad[k];
    }
  }
  return theta;
}

function trainLinearModel(X, y, opts={}) {
  if (X.length === 0) return null;
  const { Xs, mu, sigma } = featureScale(X);
  const alpha = opts.alpha || 0.01;
  const iters = opts.iters || 3000;
  const theta = gradientDescent(Xs, y, alpha, iters);
  return { theta, mu, sigma };
}

function predictLinear(model, rawX) {
  if (!model) return null;
  const { theta, mu, sigma } = model;
  const scaled = rawX.map((v,j) => (v - mu[j]) / sigma[j]);
  let out = theta[0];
  for (let j=0;j<scaled.length;j++) out += theta[j+1]*scaled[j];
  return out;
}

// ===== Build training sets from DB =====
function buildTrainingForFinalCGPA() {
  const X=[], y=[];
  DBdata.students.forEach(st => {
    const prevGPA = typeof st.cumulativeGPA === 'number' ? st.cumulativeGPA : 0;
    st.records.forEach(rec => {
      if (rec.cgpa != null) {
        X.push([rec.mid1 || 0, rec.mid2 || 0, prevGPA]);
        y.push(rec.cgpa);
      }
    });
  });
  return {X,y};
}
function buildTrainingForEndsemMarks() {
  const X=[], y=[];
  DBdata.students.forEach(st => {
    const prevGPA = typeof st.cumulativeGPA === 'number' ? st.cumulativeGPA : 0;
    st.records.forEach(rec => {
      if (rec.endsem != null) {
        X.push([rec.mid1 || 0, rec.mid2 || 0, prevGPA]);
        y.push(rec.endsem);
      }
    });
  });
  return {X,y};
}

// ===== Pretrain models when script loads (if enough data) =====
let model_finalCGPA = null;
let model_endsem = null;
(function pretrain() {
  const {X: X1, y: y1} = buildTrainingForFinalCGPA();
  if (X1.length >= 2) model_finalCGPA = trainLinearModel(X1, y1, {alpha:0.01, iters:2500});
  const {X: X2, y: y2} = buildTrainingForEndsemMarks();
  if (X2.length >= 2) model_endsem = trainLinearModel(X2, y2, {alpha:0.01, iters:2500});
})();

// ===== Core logic: save marks & return predictions =====
function saveStudentMarksAndPredict(username, sem, mid1, mid2, endsemValue=null) {
  const student = findStudent(username);
  if (!student) throw new Error("Student not found");
  let rec = student.records.find(r=> r.sem === sem);
  if (!rec) {
    rec = { sem, mid1:null, mid2:null, endsem:null, cgpa:null };
    student.records.push(rec);
  }
  if (mid1 != null) rec.mid1 = mid1;
  if (mid2 != null) rec.mid2 = mid2;
  if (endsemValue != null) rec.endsem = endsemValue;

  // Save
  DB.save(DBdata);

  const prevGPA = student.cumulativeGPA || 0;
  let predictedEnd = null;
  let predictedFinalCGPA = null;

  if (rec.endsem == null) {
    // predict endsem
    if (model_endsem) predictedEnd = predictLinear(model_endsem, [rec.mid1||0, rec.mid2||0, prevGPA]);
    else predictedEnd = ((rec.mid1||0) + (rec.mid2||0)) * 2; // fallback heuristic

    // predict final CGPA
    if (model_finalCGPA) predictedFinalCGPA = predictLinear(model_finalCGPA, [rec.mid1||0, rec.mid2||0, prevGPA]);
    else {
      const total = (rec.mid1||0) + (rec.mid2||0) + predictedEnd;
      predictedFinalCGPA = Math.min(10, Math.max(0, (total/100)*10));
    }
  } else {
    // endsem present -> compute cgpa
    if (rec.cgpa == null) {
      if (model_finalCGPA) predictedFinalCGPA = predictLinear(model_finalCGPA, [rec.mid1||0, rec.mid2||0, prevGPA]);
      else {
        const total = (rec.mid1||0) + (rec.mid2||0) + (rec.endsem||0);
        predictedFinalCGPA = Math.min(10, Math.max(0, (total/100)*10));
      }
      rec.cgpa = Number(predictedFinalCGPA.toFixed(2));
      DB.save(DBdata);
    } else {
      predictedFinalCGPA = rec.cgpa;
    }
  }

  // predict next sem CGPA (simple heuristic: next ≈ currentFinal * 0.98 + prevGPA*0.02 OR model could be trained)
  let predictedNextSemCGPA = null;
  if (predictedFinalCGPA != null) {
    predictedNextSemCGPA = Number((0.9*predictedFinalCGPA + 0.1*(student.cumulativeGPA||predictedFinalCGPA)).toFixed(2));
  }

  return {
    student: student.username,
    sem,
    mid1: rec.mid1, mid2: rec.mid2,
    endsem: rec.endsem,
    predictedEnd: predictedEnd != null ? Number(predictedEnd.toFixed(2)) : null,
    predictedFinalCGPA: predictedFinalCGPA != null ? Number(predictedFinalCGPA.toFixed(2)) : null,
    predictedNextSemCGPA
  };
}

// ===== Faculty helpers =====
function computeFacultyAverages(facultyUsername) {
  const f = findFaculty(facultyUsername);
  if (!f) return null;
  const studObjs = f.students.map(u => findStudent(u)).filter(Boolean);
  let cgpaSum=0, count=0;
  studObjs.forEach(s => {
    const recs = s.records.filter(r=> r.cgpa != null);
    if (recs.length>0) {
      const latest = recs[recs.length-1];
      cgpaSum += latest.cgpa;
      count++;
    }
  });
  return { avgCGPA: count>0 ? Number((cgpaSum/count).toFixed(2)) : null, studentCount: studObjs.length };
}

function getStudentPerformance(username) {
  const s = findStudent(username);
  if (!s) return null;
  const recs = s.records.slice().sort((a,b)=>a.sem-b.sem);
  const trend = recs.map(r => ({ sem: r.sem, cgpa: r.cgpa }));
  return { username: s.username, name: s.name, cumulativeGPA: s.cumulativeGPA, records: recs, trend };
}

// ====== UI binding & login handling ======

function initLoginHandlers() {
  const sBtn = document.getElementById("studentLoginBtn");
  if (sBtn) {
    sBtn.addEventListener("click", ()=> {
      const u = document.getElementById("studentUsername").value.trim();
      const p = document.getElementById("studentPassword").value;
      const s = findStudent(u);
      if (s && s.password === p) {
        localStorage.setItem("loggedStudent", JSON.stringify({ username: s.username }));
        window.location.href = "studentDashboard.html";
      } else alert("Invalid student credentials");
    });
  }

  const fBtn = document.getElementById("facultyLoginBtn");
  if (fBtn) {
    fBtn.addEventListener("click", ()=> {
      const u = document.getElementById("facultyUsername").value.trim();
      const p = document.getElementById("facultyPassword").value;
      const f = findFaculty(u);
      if (f && f.password === p) {
        localStorage.setItem("loggedFaculty", JSON.stringify({ username: f.username }));
        window.location.href = "facultyDashboard.html";
      } else alert("Invalid faculty credentials");
    });
  }
}

function renderStudentDashboard() {
  const infoBox = document.getElementById("studentInfoBox");
  const logged = JSON.parse(localStorage.getItem("loggedStudent") || "null");
  if (!logged || !infoBox) return;
  const s = findStudent(logged.username);
  if (!s) {
    infoBox.innerHTML = "<p>No student found. Please login again.</p>";
    return;
  }
  infoBox.innerHTML = `<h3>${s.name} (${s.username})</h3>
    <p><small class="note">Cumulative GPA: ${s.cumulativeGPA ?? "—"}</small></p>`;

  // prefill marks if latest sem exists
  const semInput = document.getElementById("sem");
  const m1Input = document.getElementById("mid1");
  const m2Input = document.getElementById("mid2");
  const endInput = document.getElementById("endsem");
  const latest = s.records.slice().sort((a,b)=>b.sem-a.sem)[0];
  if (latest) {
    semInput.value = latest.sem;
    if (latest.mid1 != null) m1Input.value = latest.mid1;
    if (latest.mid2 != null) m2Input.value = latest.mid2;
    if (latest.endsem != null) endInput.value = latest.endsem;
  }

  // bind save button
  const saveBtn = document.getElementById("saveMarksBtn");
  saveBtn.addEventListener("click", ()=> {
    const sem = Number(document.getElementById("sem").value);
    const m1 = Number(document.getElementById("mid1").value);
    const m2 = Number(document.getElementById("mid2").value);
    const endValRaw = document.getElementById("endsem").value;
    const end = endValRaw === "" ? null : Number(endValRaw);
    if (isNaN(sem) || isNaN(m1) || isNaN(m2)) { alert("Please enter valid numbers."); return; }
    const res = saveStudentMarksAndPredict(s.username, sem, m1, m2, end);
    const box = document.getElementById("predictionBox");
    box.innerHTML = `
      <p><strong>Predicted Endsem:</strong> ${res.predictedEnd ?? "—"}</p>
      <p><strong>Predicted Final CGPA:</strong> ${res.predictedFinalCGPA ?? "—"}</p>
      <p><strong>Predicted Next Sem CGPA:</strong> ${res.predictedNextSemCGPA ?? "—"}</p>
      <small class="note">Saved to local database.</small>
    `;
    renderStudentTrendChart(s.username);
  });

  // render initial chart
  renderStudentTrendChart(s.username);
}

let studentChartInstance = null;
function renderStudentTrendChart(username) {
  const perf = getStudentPerformance(username);
  if (!perf) return;
  const canvas = document.getElementById("studentTrendChart");
  if (!canvas) return;
  const labels = perf.records.map(r => "Sem " + r.sem);
  const data = perf.records.map(r => r.cgpa != null ? r.cgpa : null);

  if (studentChartInstance) studentChartInstance.destroy();
  studentChartInstance = new Chart(canvas.getContext("2d"), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'CGPA',
        data,
        fill: false,
        tension: 0.2,
      }]
    },
    options: {
      scales: {
        y: { suggestedMin: 0, suggestedMax: 10 }
      }
    }
  });
}

// ===== Faculty dashboard rendering =====
function renderFacultyDashboard() {
  const infoBox = document.getElementById("facultyInfoBox");
  const logged = JSON.parse(localStorage.getItem("loggedFaculty") || "null");
  if (!logged || !infoBox) return;
  const f = findFaculty(logged.username);
  if (!f) {
    infoBox.innerHTML = "<p>No faculty found. Please login again.</p>";
    return;
  }
  infoBox.innerHTML = `<h3>${f.name} (${f.username})</h3><p><small class="note">Subject: ${f.subject}</small></p>`;
  // class summary
  const summary = computeFacultyAverages(f.username);
  const summaryBox = document.getElementById("classSummary");
  summaryBox.innerHTML = `<p>Students assigned: ${summary.studentCount}</p>
    <p>Average latest-sem CGPA: ${summary.avgCGPA ?? "—"}</p>`;

  // populate student select
  const sel = document.getElementById("facultyStudentSelect");
  sel.innerHTML = "";
  f.students.forEach(u => {
    const s = findStudent(u);
    if (s) {
      const opt = document.createElement("option");
      opt.value = s.username;
      opt.textContent = `${s.name} (${s.username})`;
      sel.appendChild(opt);
    }
  });

  sel.addEventListener("change", ()=> {
    const u = sel.value;
    displayFacultyStudent(u);
  });

  // show first student by default
  if (sel.options.length>0) {
    sel.selectedIndex = 0;
    displayFacultyStudent(sel.value);
  }
}

let facultyStudentChart = null;
function displayFacultyStudent(username) {
  const info = getStudentPerformance(username);
  const infoBox = document.getElementById("selectedStudentInfo");
  if (!info) {
    infoBox.innerHTML = "<p>No student data</p>";
    return;
  }
  infoBox.innerHTML = `<p><strong>${info.name}</strong> — Cumulative GPA: ${info.cumulativeGPA ?? "—"}</p>
    <p><small class="note">Records:</small></p>
    <ul>${info.records.map(r => `<li>Sem ${r.sem}: mid1=${r.mid1 ?? '-'} mid2=${r.mid2 ?? '-'} end=${r.endsem ?? '-'} cgpa=${r.cgpa ?? '-'}</li>`).join("")}</ul>`;

  // chart
  const canvas = document.getElementById("facultyStudentChart");
  const labels = info.records.map(r => "Sem " + r.sem);
  const data = info.records.map(r => r.cgpa != null ? r.cgpa : null);

  if (facultyStudentChart) facultyStudentChart.destroy();
  facultyStudentChart = new Chart(canvas.getContext("2d"), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'CGPA',
        data,
        barThickness: 24
      }]
    },
    options: {
      scales: {
        y: { suggestedMin: 0, suggestedMax: 10 }
      }
    }
  });
}

// ===== Page initializer - detect which page we're on
document.addEventListener("DOMContentLoaded", () => {
  initLoginHandlers();
  if (document.body.contains(document.getElementById("studentInfoBox"))) {
    renderStudentDashboard();
  }
  if (document.body.contains(document.getElementById("facultyInfoBox"))) {
    renderFacultyDashboard();
  }
});

// ===== Expose utilities for debugging in console
window.PBL = {
  DBdata, DB, saveStudentMarksAndPredict, computeFacultyAverages, getStudentPerformance,
  trainLinearModel, predictLinear, buildTrainingForEndsemMarks, buildTrainingForFinalCGPA
};
