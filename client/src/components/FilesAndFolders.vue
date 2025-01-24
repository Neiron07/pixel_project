<template>
    <div class="container">
        <article class="files">
            <figure
                v-for="file in files"
                :key="file.id"
                @click="toggleInformation"
                :data-filename="file.filename"
                :data-reason="file.reason || 'N/A'"
                :data-status="file.status || 'N/A'"
                :data-id="file.id"
            >
                <img
                    v-if="['txt', 'docx', 'bin', 'png'].includes(file.filename.split('.').at(-1))"
                    src="~@/assets/filelogos/txt.svg"
                    alt="file icon"
                />
                <figcaption>{{ file.filename }}</figcaption>
            </figure>
        </article>

        <!-- Детальная информация о файле -->
        <FileInformation
            :fileInformation="fileInformation"
            :currentPath="currentPath"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import FileInformation from "./../components/sidebar/pc/FileInformation.vue";
import axios from "axios";

const viewportWidth = ref(window.innerWidth);
const isSidebarVisible = ref(viewportWidth.value > 768);

const fileInformation = ref<{ id:number; name: string; reason: string, status?: string } | null>(null);
const files = ref([]);
const currentPath = ref(window.location.pathname);


async function fetchFiles() {
    try {
        const token = `Bearer ${localStorage.token}`;

        const response = await axios.get("http://localhost:5000/files/all", {
            headers: { Authorization: token },
        });

        files.value = response.data;
    } catch (error) {
        console.error("Ошибка при загрузке файлов:", error);
    }
}

onMounted(() => {
    fetchFiles();

    window.addEventListener("resize", () => {
        viewportWidth.value = window.innerWidth;
        isSidebarVisible.value = viewportWidth.value > 768;

        deselectActiveFile();
    });
});


function toggleInformation(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const figure = target.closest("figure");

    if (figure?.classList.contains("active-file")) {
        deselectActiveFile();
        fileInformation.value = null;
        return;
    } else {
        deselectActiveFile();
        figure?.classList.add("active-file");

        const id = figure?.dataset.id;
        const fileName = figure?.dataset.filename;
        const reason = figure?.dataset.reason;
        const fileStatus = figure?.dataset.status;
        console.log(figure?.dataset)
        if (fileName && reason && id) {
            fileInformation.value = {
                id: +id,
                name: fileName,
                reason: reason,
                status: fileStatus
            };
        }
    }
}

function deselectActiveFile() {
    const activeFile = document.querySelector(".active-file");
    if (activeFile) {
        activeFile.classList.remove("active-file");
    }
}
</script>
<style scoped>
.item {
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: var(--radius);
    color: var(--contextmenu-text-color);
}

.item:hover {
    background-color: var(--contextmenu-hover-color);
}

.container {
    display: flex;
    flex-flow: column;
    gap: 2rem;
    margin-block: 2rem;
}

.active-file {
    background-color: var(--secondary-color);
    flex-wrap: wrap;
    width: fit-content;
    border-radius: 5px;
}

.file footer:not(.hidden) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: 1;
    padding-inline: 5px;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.file footer button {
    padding: 5px 10px;
    cursor: pointer;
}

/* article.files,
article.folders {
    --size: 100px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--size), 1fr));
    gap: 1rem;
}

article figure img {
    width: var(--size);
} */

article.files figure,
article.folders figure {
    --size: 5rem;
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 10px;
}

article.files figure img,
article.folders figure img {
    width: var(--size);
    height: var(--size);
}

figcaption {
    word-break: break-all;
}

@media screen and (min-width: 768px) {
    .container {
        margin-block: 4rem;
    }

    article.files,
    article.folders {
        --size: 120px;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(var(--size), 1fr));
        gap: 1rem;
    }

    article.files figure,
    article.folders figure {
        --size: 100px;
        display: block;
    }

    article.files figure img,
    article.folders figure img {
        width: var(--size);
        height: var(--size);
    }
}
</style>
