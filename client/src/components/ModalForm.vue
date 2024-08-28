<template>
    <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
      <div class="modal" :style="{ 'min-width': formWidth + 'px' }">
        <h2>{{title1}}</h2>
        <slot></slot>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      isVisible: {
        type: Boolean,
        default: false,
      },
      formWidth: Number,
      title1: {
        type: String,
        default: '标题',
      },
    },
    data() {
      return {
      };
    },
    methods: {
      closeModal() {
        this.$emit('close');
      },
    //   handleSubmit() {
    //     // Handle the submit logic here
    //     console.log('Selected type:', this.selectedType);
    //     this.closeModal();
    //   },
    },
  };
  </script>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }
  .modal {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  .modal h2 {
    margin-top: 0;
  }
  </style>
  