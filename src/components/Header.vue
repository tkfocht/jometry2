<template>
    <div id="header">
        <div id="site-mast">J!ometry</div>
        <div id="navigation">
            <span class="navigation-item"><a href="/">Home</a></span>
            <span class="navigation-item"><a href="/contestant_index.html">Contestant&nbsp;Index</a></span>
            <span class="navigation-item"><a href="/glossary.html">Glossary</a></span>
            <span class="navigation-item"><a href="https:///jometry.substack.com">Substack</a></span>
            <span class="navigation-item"><a href="/about.html">About</a></span>
        </div>
    </div>
</template>

<style scoped>
#header {
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;

    background-color: var(--color-jometry-primary);
    color: var(--color-text-on-jometry-primary);
}

#header a:link, #header a:visited {
    color: var(--color-text-on-jometry-primary);
    text-decoration: none;
}

#site-mast {
    font-size: 24px;
    margin-left: 0.5em;
    margin-right: 1em;
}

.navigation-item {
    margin: auto 0.7em;
}
</style>

