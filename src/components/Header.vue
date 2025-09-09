<script setup>
import { subdomainIdentifier, isSyndicated, isPopCulture } from '@/util'
</script>

<template>
    <div>
    <div class="navbar navbar-dark navbar-expand-md text-bg-primary navbar-primary" :data-bs-theme="subdomainIdentifier()">
        <div id="site-mast" class="navbar-brand text-bg-primary ms-3">
            <a href="/" v-if="isPopCulture()">Pop Culture J!ometry</a>
            <a href="/" v-else>J!ometry</a>
        </div>
        <button class="navbar-toggler me-3" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent" area-expanded="false" area-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div id="navbarSupportedContent" class="collapse navbar-collapse">
            <ul class="navbar-nav me-auto mb-2 mb-md-0 ms-2">
                <li class="nav-item ms-md-3"><a href="/">Home</a></li>
                <li class="nav-item ms-md-3" v-if="isSyndicated()"><a href="/period.html?toc_period=2026&play_classification=regular">Statistics</a></li>
                <li class="nav-item ms-md-3" v-if="isPopCulture()"><a href="/period.html?toc_period=POP1">Statistics</a></li>
                <li class="nav-item ms-md-3" v-if="isSyndicated()"><a href="/period_games.html?season=42">Games</a></li>
                <li class="nav-item ms-md-3" v-if="isPopCulture()"><a href="/period_games.html?season=POP1">Games</a></li>
                <li class="nav-item ms-md-3" v-if="isPopCulture()"><a href="/team_index.html">Teams</a></li>
                <li class="nav-item ms-md-3"><a href="/contestant_index.html">Contestants</a></li>
                <li class="nav-item ms-md-3"><a href="/glossary.html">Glossary</a></li>
                <li class="nav-item ms-md-3"><a href="https:///jometry.substack.com">Substack</a></li>
                <li class="nav-item ms-md-3"><a href="/about.html">About</a></li>
            </ul>
        </div>
        <div class="nav-item dropdown mx-3 px-3 d-none d-lg-block">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                All J-ometry
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="https://j-ometry.com">Mainline</a></li>
                <li><a class="dropdown-item" href="https://popculture.j-ometry.com">Pop Culture</a></li>
            </ul>
        </div>
    </div>
    </div>
</template>

<style lang="scss" scoped>
a:link, a:visited, a:hover {
  text-decoration: none;
}

.navbar {
    margin-bottom: 1rem;
}

</style>

