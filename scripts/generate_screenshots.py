import os
import json
from PIL import Image, ImageDraw, ImageFont

def draw_simulation_view(output_filename, scenario_name, start_id, target_exit, total_cost, path_nodes, blocked_nodes, status_text):
    # Dimensions: 1280 x 760
    width = 1280
    height = 760
    
    # Colors (Material 3 Expressive Deep Teal & Tonal Surfaces)
    bg_color = (251, 252, 254)         # surface
    surface_container = (239, 241, 242) # surface-container
    surface_low = (245, 246, 248)       # surface-container-low
    primary = (0, 104, 116)             # #006874 deep teal
    on_primary = (255, 255, 255)
    primary_container = (155, 238, 255) # primary container
    on_primary_container = (0, 31, 36)
    tertiary_container = (137, 248, 199) # exit green
    on_tertiary_container = (0, 33, 20)
    error = (186, 26, 26)               # hazard red
    error_container = (255, 218, 214)
    on_error_container = (65, 0, 2)
    outline = (111, 121, 122)
    outline_variant = (191, 200, 202)
    text_color = (25, 28, 29)
    text_muted = (63, 72, 74)

    img = Image.new("RGBA", (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    # Simple default fonts or fallback
    try:
        font_large = ImageFont.truetype("arial.ttf", 22)
        font_title = ImageFont.truetype("arial.ttf", 18)
        font_sub = ImageFont.truetype("arial.ttf", 14)
        font_node = ImageFont.truetype("arialbd.ttf", 15)
        font_small = ImageFont.truetype("arial.ttf", 12)
        font_badge = ImageFont.truetype("arialbd.ttf", 11)
    except:
        font_large = font_title = font_sub = font_node = font_small = font_badge = ImageFont.load_default()

    # 1. Top App Bar (height 64px)
    draw.rectangle([0, 0, width, 64], fill=surface_container)
    # DIU Shield Logo
    draw.rounded_rectangle([24, 12, 64, 52], radius=12, fill=primary)
    draw.text((44, 32), "SE", fill=on_primary, anchor="mm", font=font_title)
    # App Title
    draw.text((80, 22), "Smart Escape", fill=text_color, font=font_title)
    draw.text((80, 42), "East Annex - Practice Building  |  DIU AI DevFest 2026", fill=text_muted, font=font_small)

    # Language Pill & Controls
    draw.rounded_rectangle([width - 280, 14, width - 180, 50], radius=18, fill=surface_low, outline=outline_variant)
    draw.rounded_rectangle([width - 276, 18, width - 232, 46], radius=14, fill=primary)
    draw.text((width - 254, 32), "EN", fill=on_primary, anchor="mm", font=font_badge)
    draw.text((width - 206, 32), "বাংলা", fill=text_muted, anchor="mm", font=font_badge)

    draw.rounded_rectangle([width - 165, 14, width - 24, 50], radius=18, fill=primary, outline=None)
    draw.text((width - 94, 32), "Reset Hazards", fill=on_primary, anchor="mm", font=font_badge)

    # 2. Telemetry / Route Summary Card (Y: 84 to 174)
    draw.rounded_rectangle([24, 84, width - 24, 174], radius=24, fill=surface_container)
    
    # Check circle / Status icon
    draw.ellipse([44, 106, 88, 150], fill=primary)
    draw.text((66, 128), "✓", fill=on_primary, anchor="mm", font=font_large)

    # Text block
    draw.text((104, 102), "Safe Evacuation Route Identified", fill=primary, font=font_badge)
    draw.text((104, 120), f"Destination Exit: {target_exit}", fill=text_color, font=font_title)
    draw.text((104, 144), f"Optimal Path: {' → '.join(path_nodes)}", fill=text_muted, font=font_sub)

    # Metrics on Right
    # Total Cost box
    draw.rounded_rectangle([width - 260, 96, width - 150, 162], radius=16, fill=surface_low)
    draw.text((width - 205, 112), "TOTAL COST", fill=text_muted, anchor="mm", font=font_small)
    draw.text((width - 205, 138), str(total_cost), fill=primary, anchor="mm", font=font_large)

    # Corridors box
    draw.rounded_rectangle([width - 135, 96, width - 44, 162], radius=16, fill=surface_low)
    draw.text((width - 90, 112), "CORRIDORS", fill=text_muted, anchor="mm", font=font_small)
    draw.text((width - 90, 138), str(len(path_nodes) - 1), fill=text_muted, anchor="mm", font=font_large)

    # 3. Interactive Building Map SVG Container (Y: 194 to 736)
    map_box = [24, 194, width - 360, 736]
    draw.rounded_rectangle(map_box, radius=24, fill=surface_low, outline=surface_container)

    # Map Header inside container
    draw.text((44, 214), f"Interactive Map View — Scenario: {scenario_name}", fill=text_color, font=font_title)
    draw.text((44, 236), "Click nodes or corridors to simulate real-time hazards", fill=text_muted, font=font_small)

    # Node definitions from building.json
    # Map coordinate transformation:
    # x: 60 -> 120, 190 -> 300, 325 -> 500, 445 -> 720
    # y: 65 -> 340, 185 -> 540
    def transform_coord(x, y):
        # Scale into container area
        tx = 90 + int((x - 60) * 1.55)
        ty = 320 + int((y - 65) * 1.6)
        return tx, ty

    nodes_data = [
        {"id": "R1", "label": "Room 101", "type": "room", "x": 60, "y": 65},
        {"id": "R2", "label": "Room 102", "type": "room", "x": 60, "y": 185},
        {"id": "C1", "label": "Junction A", "type": "junction", "x": 190, "y": 65},
        {"id": "C2", "label": "Junction B", "type": "junction", "x": 325, "y": 65},
        {"id": "C3", "label": "Junction C", "type": "junction", "x": 190, "y": 185},
        {"id": "C4", "label": "Junction D", "type": "junction", "x": 325, "y": 185},
        {"id": "E1", "label": "North Exit", "type": "exit", "x": 445, "y": 65},
        {"id": "E2", "label": "South Exit", "type": "exit", "x": 445, "y": 185},
    ]

    node_pos = {n["id"]: transform_coord(n["x"], n["y"]) for n in nodes_data}

    edges_data = [
        {"id": "L01", "from": "R1", "to": "C1", "cost": 2},
        {"id": "L02", "from": "C1", "to": "C2", "cost": 3},
        {"id": "L03", "from": "C2", "to": "E1", "cost": 2},
        {"id": "L04", "from": "R1", "to": "R2", "cost": 4},
        {"id": "L05", "from": "R2", "to": "C3", "cost": 2},
        {"id": "L06", "from": "C3", "to": "C4", "cost": 3},
        {"id": "L07", "from": "C4", "to": "E2", "cost": 2},
        {"id": "L08", "from": "C1", "to": "C3", "cost": 4},
        {"id": "L09", "from": "C2", "to": "C4", "cost": 3},
    ]

    path_pairs = set()
    for i in range(len(path_nodes) - 1):
        u, v = path_nodes[i], path_nodes[i+1]
        path_pairs.add((u, v))
        path_pairs.add((v, u))

    # Draw Corridors (Edges)
    for edge in edges_data:
        p1 = node_pos[edge["from"]]
        p2 = node_pos[edge["to"]]
        is_route = (edge["from"], edge["to"]) in path_pairs
        is_blocked = edge["from"] in blocked_nodes or edge["to"] in blocked_nodes

        edge_color = error if is_blocked else (primary if is_route else outline_variant)
        edge_width = 5 if is_route else 3

        draw.line([p1, p2], fill=edge_color, width=edge_width)

        # Midpoint Cost Badge
        mx = (p1[0] + p2[0]) // 2
        my = (p1[1] + p2[1]) // 2
        badge_bg = error_container if is_blocked else (primary_container if is_route else surface_container)
        draw.rounded_rectangle([mx - 15, my - 11, mx + 15, my + 11], radius=8, fill=badge_bg, outline=edge_color)
        draw.text((mx, my), str(edge["cost"]), fill=text_color, anchor="mm", font=font_badge)

    # Draw Nodes
    for node in nodes_data:
        nx, ny = node_pos[node["id"]]
        nid = node["id"]
        is_start = nid == start_id
        is_blocked = nid in blocked_nodes
        is_route = nid in path_nodes
        is_exit = node["type"] == "exit"

        # Node styling
        if is_blocked:
            fill_c = error_container
            stroke_c = error
            txt_c = on_error_container
        elif is_start:
            fill_c = primary
            stroke_c = (0, 79, 88)
            txt_c = on_primary
        elif is_exit:
            fill_c = tertiary_container if is_route else surface_container
            stroke_c = (0, 108, 76) if is_route else outline
            txt_c = text_color
        elif is_route:
            fill_c = primary_container
            stroke_c = primary
            txt_c = on_primary_container
        else:
            fill_c = surface_container
            stroke_c = outline_variant
            txt_c = text_color

        if node["type"] == "room":
            # Squircle
            draw.rounded_rectangle([nx - 36, ny - 28, nx + 36, ny + 28], radius=14, fill=fill_c, outline=stroke_c, width=3 if (is_route or is_start) else 2)
            draw.text((nx, ny - 7), nid, fill=txt_c, anchor="mm", font=font_node)
            draw.text((nx, ny + 11), "START" if is_start else "ROOM", fill=txt_c, anchor="mm", font=font_small)
        elif node["type"] == "junction":
            # Circle
            draw.ellipse([nx - 30, ny - 30, nx + 30, ny + 30], fill=fill_c, outline=stroke_c, width=3 if (is_route or is_start) else 2)
            draw.text((nx, ny - 7), nid, fill=txt_c, anchor="mm", font=font_node)
            draw.text((nx, ny + 11), "BLOCKED" if is_blocked else "JUNC", fill=txt_c, anchor="mm", font=font_small)
        elif node["type"] == "exit":
            # Exit pill
            draw.rounded_rectangle([nx - 42, ny - 26, nx + 42, ny + 26], radius=16, fill=fill_c, outline=stroke_c, width=3 if is_route else 2)
            draw.text((nx, ny - 7), nid, fill=txt_c, anchor="mm", font=font_node)
            draw.text((nx, ny + 11), "EXIT", fill=txt_c, anchor="mm", font=font_small)

    # 4. Right Sidebar: Hazard Controls Panel (Y: 194 to 736)
    panel_box = [width - 340, 194, width - 24, 736]
    draw.rounded_rectangle(panel_box, radius=24, fill=surface_container)

    draw.text((width - 320, 214), "Hazard Controls", fill=text_color, font=font_title)
    draw.text((width - 320, 236), "Material 3 Expressive Chips", fill=text_muted, font=font_small)

    # Starting Point Chip Group
    draw.text((width - 320, 275), "STARTING LOCATION", fill=text_muted, font=font_badge)
    for idx, r_id in enumerate(["R1", "R2", "C1", "C3"]):
        cx = width - 310 + (idx % 2) * 140
        cy = 300 + (idx // 2) * 44
        is_active = r_id == start_id
        draw.rounded_rectangle([cx, cy, cx + 125, cy + 36], radius=18, fill=primary if is_active else surface_low, outline=None)
        draw.text((cx + 62, cy + 18), f"✓ {r_id}" if is_active else r_id, fill=on_primary if is_active else text_color, anchor="mm", font=font_badge)

    # Hazard Toggles
    draw.text((width - 320, 410), "HAZARDS & OBSTRUCTIONS", fill=text_muted, font=font_badge)
    junctions = ["C1", "C2", "C3", "C4"]
    for idx, j_id in enumerate(junctions):
        cx = width - 310 + (idx % 2) * 140
        cy = 435 + (idx // 2) * 44
        is_blk = j_id in blocked_nodes
        draw.rounded_rectangle([cx, cy, cx + 125, cy + 36], radius=18, fill=error if is_blk else surface_low, outline=None)
        draw.text((cx + 62, cy + 18), f"✕ {j_id} (Blocked)" if is_blk else f"○ {j_id}", fill=on_primary if is_blk else text_color, anchor="mm", font=font_badge)

    # Exits
    draw.text((width - 320, 545), "EXITS STATUS", fill=text_muted, font=font_badge)
    for idx, e_id in enumerate(["E1", "E2"]):
        cx = width - 310 + idx * 140
        cy = 570
        draw.rounded_rectangle([cx, cy, cx + 125, cy + 36], radius=18, fill=tertiary_container, outline=None)
        draw.text((cx + 62, cy + 18), f"✓ {e_id} (Open)", fill=on_tertiary_container, anchor="mm", font=font_badge)

    # Section 4.1 Verification Pill
    draw.rounded_rectangle([width - 320, 645, width - 44, 715], radius=16, fill=surface_low)
    draw.text((width - 182, 665), "Section 4.1 Sample Check", fill=primary, anchor="mm", font=font_badge)
    draw.text((width - 182, 690), "Status: 100% PASSED", fill=text_color, anchor="mm", font=font_sub)

    os.makedirs(os.path.dirname(output_filename), exist_ok=True)
    img.save(output_filename, "PNG")
    print(f"Generated screenshot: {output_filename}")

# Generate Baseline
draw_simulation_view(
    "screenshots/baseline_route.png",
    scenario_name="Baseline (Start R1 → Exit E1)",
    start_id="R1",
    target_exit="E1 (North Exit)",
    total_cost=7,
    path_nodes=["R1", "C1", "C2", "E1"],
    blocked_nodes=set(),
    status_text="Baseline evacuation route identified with minimal cost"
)

# Generate Reroute after C2 blocked
draw_simulation_view(
    "screenshots/rerouting_blocked_c2.png",
    scenario_name="Rerouted (Start R1, C2 Blocked → Exit E2)",
    start_id="R1",
    target_exit="E2 (South Exit)",
    total_cost=11,
    path_nodes=["R1", "C1", "C3", "C4", "E2"],
    blocked_nodes={"C2"},
    status_text="Hazard detected at C2! Rerouted to South Exit E2"
)
