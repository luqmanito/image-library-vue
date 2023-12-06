<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-file-input
          v-model="selectedFile"
          label="Upload Image"
          :rules="fileInputRules"
          :loading="loading"
          :disabled="loading"
          accept=".jpg, .jpeg, .bmp, .png, .gif"
          @change="convertToBase64"
        ></v-file-input>
      </v-col>
    </v-row>
    <v-row>
      <v-col v-for="(image, index) in images" :key="index" cols="12" md="4">
        <v-card>
          <v-img :src="image.url" aspect-ratio="1"></v-img>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useToast } from "vue-toast-notification";
import { onMounted, ref } from "vue";
import axios from "axios";

const selectedFile = ref<File[] | undefined>([]);
const loading = ref<boolean>(false);
const images = ref<{ url: string }[]>([]);
const toast = useToast();

const FILE_SIZE_LIMIT = 2097152;
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "bmp", "png", "gif"];

const fileInputRules = [
  (v: File[]) =>
    !v.some((file) => file.size > FILE_SIZE_LIMIT) ||
    "File size should be less than 2 MB",
  (v: File[]) =>
    v.every((file) =>
      [
        "image/png",
        "image/jpeg",
        "image/bmp",
        "image/png",
        "image/gif",
      ].includes(file.type)
    ) || "Invalid file type. Only PNG, JPEG, GIF, JPG, and BMP are allowed",
];

const convertToBase64 = () => {
  if (!selectedFile.value) return;

  const extension =
    selectedFile.value[0]?.name.split(".").pop() ?? "".toLowerCase();

  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    toast.error(
      "Invalid file type. Only PNG, JPEG, GIF, JPG, and BMP are allowed"
    );
    return;
  }
  if (selectedFile?.value[0]?.size > 2097152) {
    toast.error("File size should be less than 2 MB");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const base64Data = (reader?.result as string)?.split(",")[1];
    uploadImage(base64Data);
  };
  reader.readAsDataURL(selectedFile?.value[0]);
};

onMounted(() => {
  const storedImages = localStorage.getItem("galleryImages");
  if (storedImages) {
    images.value = JSON.parse(storedImages);
  }
});

const uploadImage = async (base64Data: string) => {
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append("image", base64Data);
    formData.append("key", import.meta.env.VITE_BASE_KEY);

    const response = await axios.post(
      "https://api.imgbb.com/1/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if (response) {
      const imageUrl = response.data.data.url;
      toast.success("Upload Success");
      images.value.push({ url: imageUrl });
      localStorage.setItem("galleryImages", JSON.stringify(images.value));
      selectedFile.value = undefined;
    }
  } catch (error) {
    toast.error("Upload Failed");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped></style>
