# Refactor: Use @mcp-b/react-webmcp hooks directly

## Summary

This PR refactors the codebase to use the official `@mcp-b/react-webmcp` hooks directly instead of re-exporting them through a wrapper. This aligns with best practices from the package documentation and removes unnecessary abstraction layers.

## Changes

### Core Refactoring
- **Replaced all `useMCPTool` imports** with `useWebMCP` from `@mcp-b/react-webmcp`
- **Updated all hook calls** to use the official API directly
- **Deprecated wrapper file** (`useMCPTool.ts`) with clear migration guidance
- **Maintained backward compatibility** through deprecated re-exports

### Files Modified (10 files, 57 insertions(+), 57 deletions(-))

#### Hook Files
- `src/react-app/hooks/useMCPNavigationTool.ts` - Navigation and routing tools (4 tools)
- `src/react-app/hooks/useMCPSQLTool.ts` - SQL query tools (2 tools)
- `src/react-app/hooks/useMCPGraphTools.ts` - React Flow graph manipulation (4 tools)
- `src/react-app/hooks/useMCPGraphSQLTools.ts` - SQL-based graph queries (3 tools)
- `src/react-app/hooks/useMCPTableTools.ts` - TanStack Table operations (1 tool)
- `src/react-app/hooks/useMCPGraphVisualEffects.ts` - Visual effects for graphs (4 tools)
- `src/react-app/hooks/useMCPGraph3DTools.ts` - 3D graph visualization tools
- `src/react-app/hooks/useMCPGraph3DAdvanced.ts` - Advanced 3D features

#### Component Files
- `src/react-app/components/graph/GraphWithEffects.tsx` - Component-level tools

#### Wrapper File (Deprecated)
- `src/react-app/hooks/useMCPTool.ts` - Now deprecated with migration guidance

## Benefits

✅ **Direct package usage** - No unnecessary abstraction layers
✅ **Aligned with official docs** - Following @mcp-b/react-webmcp best practices
✅ **Better maintainability** - Easier to update and debug
✅ **Backward compatible** - Old imports still work (with deprecation warnings)
✅ **Type-safe** - Full TypeScript support maintained
✅ **Cleaner codebase** - Removed redundant re-exports

## Migration Guide

### Old Code (Deprecated)
```typescript
import { useMCPTool, useMCPContextTool } from './useMCPTool';

useMCPTool({
  name: 'my_tool',
  description: 'My tool description',
  // ...
});
```

### New Code (Recommended)
```typescript
import { useWebMCP, useWebMCPContext } from '@mcp-b/react-webmcp';

useWebMCP({
  name: 'my_tool',
  description: 'My tool description',
  // ...
});
```

## Testing

All tools maintain their existing functionality:
- ✅ Navigation tools (navigate, get_current_context, list_all_routes, app_gateway)
- ✅ SQL tools (get_database_info, sql_query)
- ✅ Graph manipulation tools (query, focus, clear highlights, statistics)
- ✅ Graph SQL tools (find connections, find paths, analyze clusters)
- ✅ Table tools (all table operations)
- ✅ Visual effects tools (ripple, category highlight, path animation, pulsing)
- ✅ 3D graph tools (all 3D visualization features)

## Breaking Changes

**None** - This is a non-breaking change. All existing code continues to work through deprecated re-exports.

## Documentation Updates

The `useMCPTool.ts` file now includes:
- Clear deprecation warnings
- Migration instructions
- Links to official hooks

## Review Checklist

- [x] All imports updated to use official package
- [x] All hook calls refactored to use `useWebMCP`
- [x] Backward compatibility maintained
- [x] Deprecation warnings added
- [x] Migration guide documented
- [x] All tools verified to work correctly
- [x] Code changes are minimal and focused
- [x] No functionality changes - pure refactoring

## Next Steps

Future work could include:
1. Remove deprecated re-exports after migration period
2. Update any documentation referencing `useMCPTool`
3. Add ESLint rules to encourage direct package usage

---

**Ready for production** ✅
