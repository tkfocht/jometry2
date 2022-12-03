<template>
    <div id="header">
        <div id="site-mast">J!ometry</div>
        <div id="navigation">
            <span class="navigation-item"><a href="/">Home</a></span>
            <span class="navigation-item"><a href="/contestant_index.html">Contestant&nbsp;Index</a></span>
            <span class="navigation-item"><a href="/glossary.html">Glossary</a></span>
            <span class="navigation-item"><a href="/blog.html">Blog</a></span>
            <span class="navigation-item"><a href="/about.html">About</a></span>
        </div>
    </div>
</template>

<style scoped>
#header {
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: flex-end;
    width: 100vw;

    border-bottom: 2px solid black;
}

#site-mast {
    font-size: 24px;
    margin-left: 0.5em;
    margin-right: 1em;
}

.navigation-item {
    margin-left: 0.5em;
}
</style>

