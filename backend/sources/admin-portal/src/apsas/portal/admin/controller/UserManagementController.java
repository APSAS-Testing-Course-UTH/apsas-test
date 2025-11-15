package apsas.portal.admin.controller;

import apsas.portal.admin.client.IdentityServiceClient;
import apsas.portal.admin.dto.CreateUserRequest;
import apsas.portal.admin.dto.UserResponse;
import apsas.shared.models.pagination.PageResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserManagementController {

  private final IdentityServiceClient identityServiceClient;

  @GetMapping
  public String listUsers(
      @RequestParam(defaultValue = "0")
      int page,
      @RequestParam(defaultValue = "10")
      int size,
      @RequestParam(required = false)
      String role,
      Model model
  ) {
    PageResponse<UserResponse> users;
    try {
      if (role != null && !role.isEmpty()) {
        users = identityServiceClient.getUsersByRole(role, page, size);
      } else {
        users = identityServiceClient.getAllUsers(page, size);
      }
    } catch (Exception e) {
      // Create empty page response on error
      users = new PageResponse<>(List.of(), page, size, 0, 0, true, true, false, false);
      model.addAttribute("error", "Failed to fetch users: " + e.getMessage());
    }

    model.addAttribute("users", users);
    model.addAttribute("currentPage", page);
    model.addAttribute("pageSize", size);
    model.addAttribute("selectedRole", role);
    return "users";
  }

  @GetMapping("/new")
  public String showCreateUserForm(Model model) {
    model.addAttribute(
        "user",
        new CreateUserRequest(null, null, null, null, "STUDENT", true, true)
    );
    return "user-form";
  }

  @PostMapping
  public String createUser(
      @ModelAttribute
      CreateUserRequest request,
      RedirectAttributes redirectAttributes
  ) {
    try {
      identityServiceClient.createUser(request);
      redirectAttributes.addFlashAttribute("success", "User created successfully");
    } catch (Exception e) {
      redirectAttributes.addFlashAttribute("error", "Failed to create user: " + e.getMessage());
    }
    return "redirect:/users";
  }

  @GetMapping("/{id}")
  public String viewUser(
      @PathVariable
      String id, Model model
  ) {
    try {
      UserResponse user = identityServiceClient.getUserById(id);
      model.addAttribute("user", user);
      return "user-detail";
    } catch (Exception e) {
      model.addAttribute("error", "Failed to fetch user: " + e.getMessage());
      return "redirect:/users";
    }
  }

  @PostMapping("/{id}/activate")
  public String activateUser(
      @PathVariable
      String id,
      RedirectAttributes redirectAttributes
  ) {
    try {
      identityServiceClient.activateUser(id);
      redirectAttributes.addFlashAttribute("success", "User activated successfully");
    } catch (Exception e) {
      redirectAttributes.addFlashAttribute("error", "Failed to activate user: " + e.getMessage());
    }
    return "redirect:/users";
  }

  @PostMapping("/{id}/deactivate")
  public String deactivateUser(
      @PathVariable
      String id,
      RedirectAttributes redirectAttributes
  ) {
    try {
      identityServiceClient.deactivateUser(id);
      redirectAttributes.addFlashAttribute("success", "User deactivated successfully");
    } catch (Exception e) {
      redirectAttributes.addFlashAttribute("error", "Failed to deactivate user: " + e.getMessage());
    }
    return "redirect:/users";
  }

  @PostMapping("/{id}/delete")
  public String deleteUser(
      @PathVariable
      String id,
      RedirectAttributes redirectAttributes
  ) {
    try {
      identityServiceClient.deleteUser(id);
      redirectAttributes.addFlashAttribute("success", "User deleted successfully");
    } catch (Exception e) {
      redirectAttributes.addFlashAttribute("error", "Failed to delete user: " + e.getMessage());
    }
    return "redirect:/users";
  }
}
