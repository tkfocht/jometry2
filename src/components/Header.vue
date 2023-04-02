<template>
    <div id="header">
        <div id="site-mast">J!ometry</div>
        <div id="navigation">
            <span class="navigation-item"><router-link to="/">Home</router-link></span>
            <span class="navigation-item"><router-link to="/contestant_index">Contestant&nbsp;Index</router-link></span>
            <span class="navigation-item"><router-link to="/glossary">Glossary</router-link></span>
            <span class="navigation-item"><a href="https:///jometry.substack.com">Substack</a></span>
            <span class="navigation-item"><router-link to="/about">About</router-link></span>
        </div>
    </div>
</template>

<style scoped>
#header {
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: flex-end;

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

