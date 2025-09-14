<template>
  <div class="border-b">
    <UContainer>
      <nav class="flex items-center justify-between h-16">
        <div class="flex items-center gap-8">
          <NuxtLink to="/" class="text-xl font-bold">
            Dtako App
          </NuxtLink>

          <div class="flex gap-4">
            <UButton
              :to="'/'"
              variant="ghost"
              :color="route.path === '/' ? 'primary' : 'gray'"
            >
              Dtako Rows
            </UButton>
            <UButton
              :to="'/message'"
              variant="ghost"
              :color="route.path === '/message' ? 'primary' : 'gray'"
            >
              Messages
            </UButton>
          </div>
        </div>
      </nav>
    </UContainer>
  </div>
</template>

<script setup>
const route = useRoute()
</script>