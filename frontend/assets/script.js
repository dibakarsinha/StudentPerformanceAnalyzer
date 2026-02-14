const API = "http://localhost:5000/api";

/* =========================
   STUDENT LOGIN
========================= */
function loginStudent() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch(`${API}/auth/student-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.msg === "Login successful") {
      localStorage.setItem("studentEmail", email);
      window.location.href = "studentDashboard.html";
    } else {
      document.getElementById("message").innerText = "Invalid credentials";
    }
  });
}

/* =========================
   FACULTY LOGIN
========================= */
function loginFaculty() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch(`${API}/auth/faculty-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.msg === "Login successful") {
      window.location.href = "facultyDashboard.html";
    } else {
      document.getElementById("message").innerText = "Invalid credentials";
    }
  });
}

/* =========================
   STUDENT DASHBOARD LOGIC
========================= */

let chart = null;
let studentData = null;

window.addEventListener("DOMContentLoaded", () => {

  const email = localStorage.getItem("studentEmail");
  if (!email) return;

  fetch(`${API}/student/${email}`)
    .then(res => res.json())
    .then(student => {

      console.log("STUDENT DATA:", student);

      studentData = student;

      if (!student.performances) return;

      // Fill subject list
      const select = document.getElementById("subjectSelect");
      select.innerHTML = "";

      student.performances.forEach(perf => {
        const option = document.createElement("option");
        option.value = perf.subject;
        option.text = perf.subject;
        select.appendChild(option);
      });

      // Calculate averages
      const midMarks = student.performances.map(p => p.midSem);
      const endMarks = student.performances.map(p => p.endSem);

      document.getElementById("mid").innerText = average(midMarks);
      document.getElementById("end").innerText = average(endMarks);
      document.getElementById("cgpa").innerText =
        ((average(midMarks) + average(endMarks)) / 25).toFixed(2);

    });
});

/* =========================
   GRAPH GENERATION
========================= */

function generateGraph() {

  if (!studentData || !studentData.performances) return;

  const subject = document.getElementById("subjectSelect").value;
  const type = document.getElementById("chartType").value;
  const includePrediction =
    document.getElementById("includePrediction").checked;

  const record = studentData.performances.find(
    p => p.subject === subject
  );

  if (!record) return;

  let labels = ["Mid Sem", "End Sem"];
  let data = [record.midSem, record.endSem];

  if (includePrediction) {
    const predictedMid = record.midSem + 5;
    const predictedEnd = record.endSem + 5;

    labels.push("Predicted Mid", "Predicted End");
    data.push(predictedMid, predictedEnd);
  }

  if (chart) chart.destroy();

  const ctx = document.getElementById("performanceChart");

  chart = new Chart(ctx, {
    type: type,
    data: {
      labels: labels,
      datasets: [{
        label: "Marks",
        data: data
      }]
    },
    options: {
      responsive: true
    }
  });
}

/* =========================
   UTILS
========================= */

function average(arr) {
  return (
    arr.reduce((a, b) => a + b, 0) / arr.length
  ).toFixed(1);
}

/* =========================
   PDF DOWNLOAD
========================= */

function downloadPDF() {
  html2canvas(document.getElementById("reportArea"))
    .then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jspdf.jsPDF();
      pdf.addImage(imgData, "PNG", 10, 10, 180, 0);
      pdf.save("Student_Report.pdf");
    });
}
