<template>
    <article class="file-information">
        <header>
            <h2>File Info</h2>
        </header>
        <div class="information-container flex-column gap-1" v-if="fileInformation">
            <p>Name: {{ fileInformation.name }}</p>
            <p>Status: {{ fileInformation.status }}</p>
            <p>Reason: {{ fileInformation.reason }}</p>
            <button class="download button" @click="downloadFile">
                <img src="~@/assets/icons/open.svg" alt="open" />
                open
            </button>
        </div>
    </article>
</template>

<script setup lang="ts">
// props
const props = defineProps<{
    fileInformation: { id: number; name: string; reason: string, status: string } | null;
    currentPath: string;
}>();

// Download file logic
async function downloadFile() {
    if (!props.fileInformation) return;

    try {
        const response = await fetch(`/files/file/${props.fileInformation.id}`, {
            method: "GET",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token"),
            },
        });

        if (!response.ok) {
            alert("Failed to download file. Please try again later.");
            return;
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Create a temporary link to trigger the download
        const link = document.createElement("a");
        link.href = url;
        link.download = props.fileInformation.name; // Use the file's name
        document.body.appendChild(link);
        link.click();

        // Cleanup
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        alert("An error occurred while downloading the file.");
        console.error(error);
    }
}

// Delete file logic
async function deleteFile() {
    const pathname = props.currentPath + "/" + props.fileInformation?.name;
    try {
        // get confirmation
        const confirmation = confirm("Are you sure you want to delete this file?");
        if (!confirmation) return;

        const response = await fetch("/delete", {
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token"),
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ pathname }),
        });

        if (response.status === 200) {
            // TODO: just remove the file from DOM
            window.location.reload();
        } else {
            alert(
                "Error deleting file\nPlease try again later, or use an account with higher permissions"
            );
        }
    } catch (error) {
        alert(error);
    }
}
</script>

<style scoped>
.file-information {
    margin-bottom: 1rem;
}
.button {
    text-decoration: none;
    padding: 0.5em 1em;
    border: none;
    border-radius: 5px;
    display: flex;
    place-items: center;
    color: var(--white);
    font-size: 1rem;
    gap: 0.5rem;
    height: 2.5rem;
}

.button:hover {
    cursor: pointer;
}

.red {
    background-color: var(--accent-color-2);
}

.red:hover {
    background-color: var(--accent-color-2-hover);
}

.download {
    background-color: var(--accent-color);
}

.button img {
    height: 100%;
}

.download:hover {
    background-color: var(--accent-color-hover);
}
</style>
