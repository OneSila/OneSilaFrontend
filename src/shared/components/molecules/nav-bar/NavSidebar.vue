<script setup lang="ts">
import { Card } from '../../atoms/card';

import NavItem from './NavItem.vue';
</script>

<template>
  <Card class="fixed top-16 left-2 max-h-64 overflow-y-auto">
    <Flex class="nav-items" gap="2" vertical>
      <FlexCell>
        <NavItem route="/products">Producten</NavItem>
      </FlexCell>

      <FlexCell>
        <NavItem route="/">Websites</NavItem>
      </FlexCell>

      <FlexCell>
        <NavItem route="/">Prijzenkaarten</NavItem>
      </FlexCell>

      <FlexCell>
        <NavItem route="/">Attributen</NavItem>
      </FlexCell>

      <FlexCell>
        <NavItem route="/">Media</NavItem>
      </FlexCell>

      <FlexCell>
        <NavItem route="/">Emeubel</NavItem>
      </FlexCell>

      <FlexCell>
        <hr />
      </FlexCell>

      <FlexCell>
        <NavItem route="/">Mijn Profiel</NavItem>
      </FlexCell>

      <FlexCell>
        <NavItem route="/">Uitloggen</NavItem>
      </FlexCell>
    </Flex>
  </Card>
</template>
