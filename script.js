// Array to hold repository data
let repositories = [];

// Load repositories from localStorage if available
if (localStorage.getItem("repositories")) {
    repositories = JSON.parse(localStorage.getItem("repositories"));
    displayRepos();
}

// Function to display repositories
function displayRepos() {
    const repoList = document.getElementById("repositories");
    repoList.innerHTML = "";
    repositories.forEach((repo, index) => {
        const div = document.createElement("div");
        div.className = "card mb-3";
        div.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${repo.name}</h5>
                <button class="btn btn-info" onclick="openRepoDetails(${index})">عرض التفاصيل</button>
                <button class="btn btn-warning" onclick="editRepo(${index})">تعديل</button>
                <button class="btn btn-danger" onclick="deleteRepo(${index})">حذف المستودع</button>
            </div>
        `;
        repoList.appendChild(div);
    });
}

// Function to open the modal for creating a new repo
function createRepo() {
    const repoModal = new bootstrap.Modal(document.getElementById('repoModal'));
    repoModal.show();
}

// Function to save the new repository
function saveRepo() {
    const repoName = document.getElementById("repoName").value;
    if (repoName) {
        repositories.push({ name: repoName, files: [] });
        localStorage.setItem("repositories", JSON.stringify(repositories));  // Save to localStorage
        displayRepos();
        const repoModal = bootstrap.Modal.getInstance(document.getElementById('repoModal'));
        repoModal.hide();
    } else {
        alert("الرجاء إدخال اسم المستودع");
    }
}

// Function to delete a repository
function deleteRepo(index) {
    if (confirm("هل أنت متأكد أنك تريد حذف هذا المستودع؟")) {
        repositories.splice(index, 1); // Remove the repository from the array
        localStorage.setItem("repositories", JSON.stringify(repositories));  // Save to localStorage
        displayRepos();
    }
}

// Function to open repo details and show the file upload section
function openRepoDetails(index) {
    const repo = repositories[index];
    document.getElementById("repoTitle").textContent = repo.name;
    document.getElementById("repoDetails").style.display = "block";
    displayRepoFiles(index);
}

// Function to close repo details
function closeDetails() {
    document.getElementById("repoDetails").style.display = "none";
}

// Function to preview the selected file before upload
function previewFile(event) {
    const file = event.target.files[0];
    const filePreview = document.getElementById("filePreview");
    const fileList = document.getElementById("fileList");

    if (file) {
        const fileSize = file.size / 1024 / 1024; // Convert to MB
        if (fileSize > 5) {
            alert("الملف كبير جدًا. الحد الأقصى للحجم هو 5 ميجابايت.");
            return;
        }

        const fileType = file.type;
        const validTypes = [
            "image/jpeg", "image/png", "application/pdf", "text/plain", 
            "application/javascript", "application/x-shellscript", 
            "text/x-csrc", "text/x-c++src", "application/x-ruby", 
            "text/html", "text/css", "text/x-python"
        ];

        if (!validTypes.includes(fileType)) {
            alert("نوع الملف غير مدعوم.");
            return;
        }

        // Highlight the file based on its programming language extension
        const fileExtension = getFileExtension(file.name);
        const languageColors = {
            "python": "#3572A5",
            "javascript": "#f1e05a",
            "ruby": "#701516",
            "c++": "#f34b7d",
            "c": "#555555",
            "html": "#e34c26",
            "css": "#563d7c",
            "shell": "#89e051"
        };

        // Preview the file if it's an image
        if (fileType.startsWith("image/")) {
            const img = document.createElement("img");
            img.src = URL.createObjectURL(file);
            filePreview.innerHTML = "";
            filePreview.appendChild(img);
        } else {
            filePreview.innerHTML = `<p>معاينة الملف غير متوفرة.</p>`;
        }

        // Add file to file list and apply color coding
        repositories.forEach(repo => {
            if (repo.name === document.getElementById("repoTitle").textContent) {
                repo.files.push(file.name);
                localStorage.setItem("repositories", JSON.stringify(repositories));  // Save to localStorage
                document.getElementById("fileList").innerHTML = repo.files.map(file => {
                    const ext = getFileExtension(file);
                    const language = getLanguageFromExtension(ext);
                    return `<p style="color: ${languageColors[language] || '#000'}">${file} (${language}) <button class="btn btn-warning btn-sm" onclick="deleteFile(${repositories.indexOf(repo)}, '${file}')">حذف</button></p>`;
                }).join('');
            }
        });

        // Show success notification
        const toast = new bootstrap.Toast(document.getElementById('toastMessage'));
        toast.show();
    }
}

// Function to get file extension
function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

// Function to get the programming language from file extension
function getLanguageFromExtension(extension) {
    const languages = {
        "py": "python",
        "js": "javascript",
        "rb": "ruby",
        "cpp": "c++",
        "c": "c",
        "html": "html",
        "css": "css",
        "sh": "shell"
    };
    return languages[extension] || "unknown";
}

// Function to delete a file from a repository
function deleteFile(repoIndex, fileName) {
    if (confirm(`هل أنت متأكد أنك تريد حذف الملف ${fileName}?`)) {
        const repo = repositories[repoIndex];
        repo.files = repo.files.filter(file => file !== fileName);
        localStorage.setItem("repositories", JSON.stringify(repositories));  // Save to localStorage
        openRepoDetails(repoIndex); // Refresh file list
    }
}

// Function to edit file name
function editFile(index, fileIndex) {
    const newName = prompt("أدخل الاسم الجديد للملف:");
    if (newName && newName.trim() !== "") {
        // Update file name in the repository
        repositories[index].files[fileIndex] = newName.trim();
        
        // Save changes to localStorage
        localStorage.setItem("repositories", JSON.stringify(repositories));
        
        // Refresh file list after edit
        displayRepoFiles(index);
        
        // Show success notification
        const toast = new bootstrap.Toast(document.getElementById('toastMessage'));
        toast.show();
    } else {
        alert("الرجاء إدخال اسم صالح للملف.");
    }
}

// Function to display files in a repository
function displayRepoFiles(index) {
    const repo = repositories[index];
    const fileList = document.getElementById("fileList");
    fileList.innerHTML = repo.files.map((file, fileIndex) => {
        const ext = getFileExtension(file);
        const language = getLanguageFromExtension(ext);
        return `
            <div>
                <p style="color: ${languageColors[language] || '#000'}">${file} (${language})</p>
                <button class="btn btn-warning" onclick="editFile(${index}, ${fileIndex})">تعديل</button>
            </div>
        `;
    }).join('');
}

// تعديل طريقة عرض الملفات في التفاصيل
function openRepoDetails(index) {
    const repo = repositories[index];
    document.getElementById("repoTitle").textContent = repo.name;
    document.getElementById("repoDetails").style.display = "block";
    displayRepoFiles(index);
}
