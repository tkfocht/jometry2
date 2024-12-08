<script setup>
import { subdomainIdentifier } from '@/util'

const subdomain = subdomainIdentifier()
</script>

<template>
    <div :data-bs-theme="subdomain">
    <div class="navbar navbar-dark navbar-expand-md text-bg-primary navbar-primary" :data-bs-theme="subdomain">
        <div id="site-mast" class="navbar-brand text-bg-primary ms-3"><a href="/">J!ometry</a></div>
        <button class="navbar-toggler me-3" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent" area-expanded="false" area-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div id="navbarSupportedContent" class="collapse navbar-collapse">
            <ul class="navbar-nav me-auto mb-2 mb-md-0 ms-2">
                <li class="nav-item ms-md-3"><a href="/">Home</a></li>
                <li class="nav-item ms-md-3"><a href="/period.html?toc_period=2026">Stat Summary</a></li>
                <li class="nav-item ms-md-3"><a href="/period_games.html?season=41">Game List</a></li>
                <li class="nav-item ms-md-3"><a href="/contestant_index.html">Contestant&nbsp;List</a></li>
                <li class="nav-item ms-md-3"><a href="/glossary.html">Glossary</a></li>
                <li class="nav-item ms-md-3"><a href="https:///jometry.substack.com">Substack</a></li>
                <li class="nav-item ms-md-3"><a href="/about.html">About</a></li>
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

