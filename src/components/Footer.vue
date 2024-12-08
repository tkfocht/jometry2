<script setup>
import { subdomainIdentifier, isSyndicated, isPopCulture } from '@/util'
</script>

<template>
    <div id="footer" class="text-bg-secondary" :data-bs-theme="subdomainIdentifier()">
        This site is not affiliated with Jeopardy! <span v-if="isPopCulture()"> or Pop Culture Jeopardy!</span>.
        <span v-if="isSyndicated()">Data is taken from their published <a href="https://www.jeopardy.com/track/jeopardata">box scores</a>
                and from <a href="https://j-archive.com">J! Archive</a>.</span>
    </div>
</template>

<style scoped>
#footer {
    font-size: 0.75rem;
    margin: 0 auto 0 auto;
    padding: 0.5rem 0.5rem;
    border-top: 1px solid #999999;
    text-align: center;
}
</style>

