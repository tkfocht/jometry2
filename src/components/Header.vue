<template>
    <div id="header" class="navbar text-bg-primary">
        <div id="site-mast"><a href="/">J!ometry</a></div>
        <div id="navigation">
            <span class="navigation-item"><a href="/">Home</a></span>
            <span class="navigation-item"><a href="/contestant_index.html">Contestant&nbsp;Index</a></span>
            <span class="navigation-item"><a href="/glossary.html">Glossary</a></span>
            <span class="navigation-item"><a href="https:///jometry.substack.com">Substack</a></span>
            <span class="navigation-item"><a href="/about.html">About</a></span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
#header {
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    margin-bottom: 1rem;
}

#site-mast {
    font-size: 1.5rem;
    margin-left: 0.5em;
    margin-right: 1em;
}

.navigation-item {
    margin: auto 0.7rem;
}

a:link, a:visited, a:hover {
  text-decoration: none;
}
</style>

